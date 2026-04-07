import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const planId = searchParams.get("planId");
  if (!planId) {
    return NextResponse.json({ error: "planId is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, tier: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isPaid =
    user.tier === "PRO_MONTHLY" ||
    user.tier === "PRO_YEARLY" ||
    user.tier === "ONE_TIME";

  if (!isPaid) {
    return NextResponse.json(
      { error: "PDF export requires a paid plan. Please upgrade to Pro." },
      { status: 403 }
    );
  }

  const plan = await prisma.gardenPlan.findFirst({
    where: { id: planId, userId: user.id, status: "COMPLETE" },
  });

  if (!plan) {
    return NextResponse.json(
      { error: "Plan not found or not yet complete" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    plan: {
      id: plan.id,
      name: plan.name,
      createdAt: plan.createdAt,
      gardenSpec: {
        length: plan.lengthMeters,
        width: plan.widthMeters,
        shape: plan.shapeType,
        sunExposure: plan.sunExposure,
        soilType: plan.soilType,
        country: plan.country,
        climateZone: plan.climateZone,
      },
      sections: plan.sections,
      plants: plan.plantList,
      positions: plan.plantPositions,
    },
  });
}
