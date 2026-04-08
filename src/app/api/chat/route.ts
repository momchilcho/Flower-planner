import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, GARDEN_DESIGN_SYSTEM_PROMPT, SKETCH_ANALYSIS_SYSTEM_PROMPT, MODEL } from "@/lib/anthropic";

const FREE_MESSAGE_LIMIT = 20;

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

  if (!session) return NextResponse.json({ messages: [] });

  return NextResponse.json({ messages: session.messages });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, sessionId, imageBase64 } = body as {
    message: string;
    sessionId?: string | null;
    imageBase64?: string | null;
  };

  const authSession = await getServerSession();
  const userId = (authSession?.user as { id?: string })?.id;

  // Get or create chat session
  let chatSession = sessionId
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
          messages: {},
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

  // Rate limit check for free users
  if (chatSession.messages.length >= FREE_MESSAGE_LIMIT) {
    return NextResponse.json(
      { error: "Message limit reached. Please upgrade to Pro for unlimited messages." },
      { status: 429 }
    );
  }

  // Save user message
  await prisma.chatMessage.create({
    data: {
      sessionId: chatSession.id,
      role: "USER",
      content: message ?? "",
      imageUrl: imageBase64 ? "data:attached" : null,
    },
  });

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

        const anthropicStream = anthropic.messages.stream({
          model: MODEL,
          max_tokens: 2048,
          system: imageBase64 && !message ? SKETCH_ANALYSIS_SYSTEM_PROMPT : GARDEN_DESIGN_SYSTEM_PROMPT,
          messages: [
            ...historyMessages,
            {
              role: "user",
              content: currentContent.length === 1 && currentContent[0].type === "text"
                ? (currentContent[0].text ?? "")
                : (currentContent as Parameters<typeof anthropic.messages.stream>[0]["messages"][0]["content"]),
            },
          ],
        });

        let fullResponse = "";

        for await (const event of anthropicStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const text = event.delta.text;
            fullResponse += text;
            // Stream each character/chunk
            controller.enqueue(encoder.encode(`data: ${text}\n\n`));
          }
        }

        // Check for plan generation trigger
        const planBlock = extractPlanBlock(fullResponse);
        const plantsBlock = extractPlantsBlock(fullResponse);

        let savedPlanId: string | null = null;

        if (planBlock?.trigger === "generate_plan") {
          // Trigger plan generation
          try {
            const generateRes = await fetch(`${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/plans/generate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                gardenSpec: planBlock.gardenSpec,
                sessionId: chatSession!.id,
                userId: chatSession!.userId,
              }),
            });

            if (generateRes.ok) {
              const { plan } = await generateRes.json();
              savedPlanId = plan.id;
              controller.enqueue(encoder.encode(`data: [PLAN:${plan.id}]\n\n`));
            }
          } catch (genErr) {
            console.error("Plan generation failed:", genErr);
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
        console.error("Streaming error:", error);
        controller.enqueue(encoder.encode(`data: Sorry, I encountered an error. Please try again.\n\n`));
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
  // Get or create a shared anonymous user for unauth sessions
  let anonUser = await prisma.user.findFirst({
    where: { email: "anonymous@gardengenius.app" },
  });

  if (!anonUser) {
    anonUser = await prisma.user.create({
      data: {
        email: "anonymous@gardengenius.app",
        name: "Guest",
      },
    });
  }

  return anonUser.id;
}
