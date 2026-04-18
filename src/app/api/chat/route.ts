import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, GARDEN_DESIGN_SYSTEM_PROMPT, SKETCH_ANALYSIS_SYSTEM_PROMPT, MODEL } from "@/lib/anthropic";
import { createOrUpdatePlan } from "@/lib/garden-plan-generator";

const FREE_MESSAGE_LIMIT = 20;

function isOverloadedError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { status?: number; error?: { type?: string }; message?: string };
  return (
    e.status === 529 ||
    e.error?.type === "overloaded_error" ||
    (typeof e.message === "string" && e.message.toLowerCase().includes("overload"))
  );
}

function friendlyErrorMessage(err: unknown): string {
  if (isOverloadedError(err)) {
    return "The AI service is temporarily busy. Please wait a moment and try again.";
  }
  if (err instanceof Error) return err.message;
  // Try to parse raw Anthropic JSON error strings
  try {
    const parsed = JSON.parse(String(err));
    return parsed?.error?.message ?? parsed?.message ?? String(err);
  } catch {
    return String(err);
  }
}

// Helper to extract JSON plan block from AI response
function extractPlanBlock(text: string): Record<string, unknown> | null {
  const match = text.match(/```json-garden-plan\n([\s\S]*?)\n```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

// Helper to extract plant cards from AI response
function extractPlantsBlock(text: string): unknown[] | null {
  const match = text.match(/```json-plants\n([\s\S]*?)\n```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ messages: [] });

  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!session) return NextResponse.json({ messages: [], planId: null });

  return NextResponse.json({ messages: session.messages, planId: session.planId ?? null });
}

export async function POST(req: NextRequest) {
  let body: { message: string; sessionId?: string | null; imageBase64?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { message, sessionId, imageBase64 } = body;

  if (imageBase64 && imageBase64.length > 7_000_000) {
    return NextResponse.json({ error: "Image too large" }, { status: 400 });
  }

  let authSession;
  try {
    authSession = await getServerSession();
  } catch (e) {
    console.error("[chat] getServerSession failed:", e);
    return NextResponse.json({ error: `Auth error: ${String(e)}` }, { status: 500 });
  }
  const userId = (authSession?.user as { id?: string })?.id;

  // Get or create chat session
  let chatSession;
  try {
    chatSession = sessionId
      ? await prisma.chatSession.findUnique({
          where: { id: sessionId },
          include: { messages: { orderBy: { createdAt: "asc" }, take: 50 } },
        })
      : null;

    if (!chatSession) {
      if (!userId) {
        // Create anonymous session (limited)
        chatSession = await prisma.chatSession.create({
          data: {
            userId: await getOrCreateAnonymousUser(),
            context: {},
          },
          include: { messages: true },
        });
      } else {
        chatSession = await prisma.chatSession.create({
          data: { userId, context: {} },
          include: { messages: true },
        });
      }
    }
  } catch (e) {
    console.error("[chat] DB session error:", e);
    return NextResponse.json({ error: `Database error: ${String(e)}` }, { status: 500 });
  }

  // Rate limit check for free users
  if (chatSession.messages.length >= FREE_MESSAGE_LIMIT) {
    return NextResponse.json(
      { error: "Message limit reached. Please upgrade to Pro for unlimited messages." },
      { status: 429 }
    );
  }

  // Save user message
  try {
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: "USER",
        content: message ?? "",
        imageUrl: imageBase64 ? "data:attached" : null,
      },
    });
  } catch (e) {
    console.error("[chat] Failed to save user message:", e);
    return NextResponse.json({ error: `Failed to save message: ${String(e)}` }, { status: 500 });
  }

  // Build Anthropic messages history
  const historyMessages = chatSession.messages.slice(-20).map((m) => ({
    role: m.role === "USER" ? "user" : "assistant" as "user" | "assistant",
    content: m.content,
  }));

  // Build current message content
  type MessageContent = { type: string; text?: string; source?: { type: string; media_type: string; data: string } };
  const currentContent: MessageContent[] = [];

  if (imageBase64) {
    const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    currentContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: base64Data ?? "",
      },
    });
  }

  if (message) {
    currentContent.push({ type: "text", text: message });
  }

  // Create streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send session ID first
        controller.enqueue(encoder.encode(`data: [SESSION:${chatSession!.id}]\n\n`));

        const streamParams = {
          model: MODEL,
          max_tokens: 2048,
          system: imageBase64 && !message ? SKETCH_ANALYSIS_SYSTEM_PROMPT : GARDEN_DESIGN_SYSTEM_PROMPT,
          messages: [
            ...historyMessages,
            {
              role: "user" as const,
              content: currentContent.length === 1 && currentContent[0].type === "text"
                ? (currentContent[0].text ?? "")
                : (currentContent as Parameters<typeof anthropic.messages.stream>[0]["messages"][0]["content"]),
            },
          ],
        };

        // Retry up to 3 times on overload (1s, 2s backoff)
        let anthropicStream;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            anthropicStream = anthropic.messages.stream(streamParams);
            break;
          } catch (err) {
            if (isOverloadedError(err) && attempt < 2) {
              await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
              continue;
            }
            throw err;
          }
        }

        let fullResponse = "";

        for await (const event of anthropicStream!) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const text = event.delta.text;
            fullResponse += text;
            // JSON-encode text so embedded newlines don't corrupt SSE framing
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(text)}\n\n`));
          }
        }

        // Check for plan generation trigger
        const planBlock = extractPlanBlock(fullResponse);
        const plantsBlock = extractPlantsBlock(fullResponse);

        if (planBlock?.trigger === "generate_plan" && planBlock.gardenSpec) {
          try {
            const { id: newPlanId } = await createOrUpdatePlan(
              planBlock.gardenSpec as Parameters<typeof createOrUpdatePlan>[0],
              chatSession!.userId,
              chatSession!.id
            );
            controller.enqueue(encoder.encode(`data: [PLAN:${newPlanId}]\n\n`));
          } catch (genErr) {
            console.error("[chat] Plan generation failed:", genErr);
            const genErrMsg = genErr instanceof Error ? genErr.message : String(genErr);
            controller.enqueue(encoder.encode(`data: [PLAN_ERROR:${genErrMsg}]\n\n`));
          }
        }

        // Save metadata
        const metadata: Record<string, unknown> = {};
        if (plantsBlock) metadata.plants = plantsBlock;
        if (planBlock) metadata.planTrigger = planBlock.gardenSpec;

        // Save AI response to DB
        await prisma.chatMessage.create({
          data: {
            sessionId: chatSession!.id,
            role: "ASSISTANT",
            content: fullResponse,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            metadata: Object.keys(metadata).length > 0 ? (metadata as any) : undefined,
          },
        });

        if (Object.keys(metadata).length > 0) {
          controller.enqueue(encoder.encode(`data: [META:${JSON.stringify(metadata)}]\n\n`));
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("[chat] Streaming error:", error);
        const errMsg = friendlyErrorMessage(error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(`Sorry, I encountered an error: ${errMsg}`)}\n\n`));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

async function getOrCreateAnonymousUser(): Promise<string> {
  const anonUser = await prisma.user.upsert({
    where: { email: "anonymous@gardengenius.app" },
    update: {},
    create: { email: "anonymous@gardengenius.app", name: "Guest" },
  });
  return anonUser.id;
}
