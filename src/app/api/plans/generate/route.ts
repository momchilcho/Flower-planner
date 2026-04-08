import { NextRequest, NextResponse } from "next/server";
import { createOrUpdatePlan } from "@/lib/garden-plan-generator";
import type { GardenSpec } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { gardenSpec, sessionId, userId } = body as {
    gardenSpec: GardenSpec;
    sessionId?: string;
    userId?: string;
  };

  if (!gardenSpec) {
    return NextResponse.json({ error: "Missing gardenSpec" }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const { id, planData } = await createOrUpdatePlan(gardenSpec, userId, sessionId);
    return NextResponse.json({ plan: { id }, planData });
  } catch (error) {
    console.error("Plan generation error:", error);
    return NextResponse.json(
      { error: `Failed to generate plan: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
