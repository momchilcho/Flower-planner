import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { PlanData, GardenPlan } from "@/types";

// Allow up to 60s for image generation (requires Vercel Pro; hobby plan = 10s)
export const maxDuration = 60;

const COUNTRY_NAMES: Record<string, string> = {
  BE: "Belgium", NL: "Netherlands", UK: "England", GB: "England",
  FR: "France", DE: "Germany", PL: "Poland", SE: "Sweden",
  DK: "Denmark", AT: "Austria", CH: "Switzerland", IT: "Italy",
};

function buildPrompt(plan: GardenPlan): string {
  const planData = plan.plantList as PlanData | null;
  const plants = planData?.plants ?? [];
  const topPlants = plants.slice(0, 8).map((p) => p.commonName).join(", ");

  const prefs = plan.preferences as Record<string, string> | null;
  const style = prefs?.stylePreference ?? "cottage naturalistic";
  const colorPref = prefs?.colorPreference ? `Color palette: ${prefs.colorPreference}. ` : "";
  const country = COUNTRY_NAMES[plan.country] ?? "European";
  const sun =
    plan.sunExposure === "FULL_SUN"
      ? "full sun"
      : plan.sunExposure === "PARTIAL_SHADE"
      ? "dappled shade"
      : "shaded";

  return [
    `Professional garden photography of a ${plan.lengthMeters}m × ${plan.widthMeters ?? 2}m ${style} perennial border in ${country}.`,
    `${sun} exposure.`,
    topPlants ? `Plants include: ${topPlants}.` : "",
    colorPref,
    "Three-layer planting: tall plants at back, medium in middle, low edging plants at front.",
    "Lush summer bloom, soft golden-hour lighting, photorealistic, ultra-detailed, 4k.",
  ]
    .filter(Boolean)
    .join(" ");
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "HUGGINGFACE_API_KEY is not set in environment variables." },
      { status: 500 }
    );
  }

  const { planId } = await req.json().catch(() => ({}));
  if (!planId) {
    return NextResponse.json({ error: "Missing planId" }, { status: 400 });
  }

  const plan = await prisma.gardenPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const prompt = buildPrompt(plan);

  const hfRes = await fetch(
    "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "x-use-cache": "false",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 4,
          width: 1024,
          height: 576,
        },
      }),
    }
  );

  if (!hfRes.ok) {
    const text = await hfRes.text();
    let message = "Image generation failed";
    try {
      const json = JSON.parse(text);
      if (json.estimated_time) {
        message = `Model is loading, please try again in ${Math.ceil(json.estimated_time)} seconds`;
      } else {
        message = json.error ?? message;
      }
    } catch { /* use default */ }
    return NextResponse.json({ error: message }, { status: hfRes.status });
  }

  const buffer = await hfRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  return NextResponse.json({
    imageUrl: `data:image/jpeg;base64,${base64}`,
    prompt,
  });
}
