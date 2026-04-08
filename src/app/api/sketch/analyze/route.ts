import { NextRequest, NextResponse } from "next/server";
import { anthropic, SKETCH_ANALYSIS_SYSTEM_PROMPT, VISION_MODEL } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  try {
    let imageBase64: string;
    let mimeType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" = "image/jpeg";

    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No image provided" }, { status: 400 });
      }

      // Process with sharp if available
      let buffer = Buffer.from(await file.arrayBuffer()) as Buffer;

      try {
        const sharp = (await import("sharp")).default;
        buffer = (await sharp(buffer)
          .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer()) as Buffer;
        mimeType = "image/jpeg";
      } catch {
        // sharp not available, use original
        mimeType = (file.type as typeof mimeType) || "image/jpeg";
      }

      imageBase64 = buffer.toString("base64");
    } else {
      // JSON with base64
      const body = await req.json();
      if (!body.imageBase64) {
        return NextResponse.json({ error: "No image provided" }, { status: 400 });
      }
      const raw = body.imageBase64 as string;
      if (raw.includes(",")) {
        const parts = raw.split(",");
        imageBase64 = parts[1] ?? "";
        const mimeMatch = parts[0].match(/data:([^;]+)/);
        if (mimeMatch) mimeType = mimeMatch[1] as typeof mimeType;
      } else {
        imageBase64 = raw;
      }
    }

    const response = await anthropic.messages.create({
      model: VISION_MODEL,
      max_tokens: 1024,
      system: SKETCH_ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType, data: imageBase64 },
            },
            {
              type: "text",
              text: "Please analyze this garden sketch or image and provide the structured JSON analysis.",
            },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
    }

    // Try to parse JSON from response
    let analysis: Record<string, unknown>;
    try {
      // Extract JSON from markdown code block if present
      const jsonMatch = content.text.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[1] : content.text);
    } catch {
      // Return raw response if JSON parsing fails
      analysis = { rawResponse: content.text, confidence: "low" };
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Sketch analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze sketch" },
      { status: 500 }
    );
  }
}
