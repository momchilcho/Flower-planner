import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { planId: string } }
) {
  const { planId } = params;

  const plan = await prisma.gardenPlan.findUnique({
    where: { id: planId },
    include: {
      chatSession: {
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 100,
          },
        },
      },
    },
  });

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  // Check access
  if (!plan.isPublic) {
    const session = await getServerSession();
    const userId = (session?.user as { id?: string })?.id;
    if (plan.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json({ plan });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { planId: string } }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { planId } = params;

  const plan = await prisma.gardenPlan.findUnique({
    where: { id: planId },
    select: { userId: true },
  });

  if (!plan || plan.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const allowedFields = [
    "name", "status", "lengthMeters", "widthMeters", "shapeType",
    "shapeData", "sketchUrl", "sketchAnalysis", "country", "climateZone",
    "sunExposure", "soilType", "preferences", "sections", "plantPositions",
    "plantList", "isPublic",
  ];

  const updateData = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowedFields.includes(k))
  );

  const updated = await prisma.gardenPlan.update({
    where: { id: planId },
    data: updateData,
  });

  return NextResponse.json({ plan: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { planId: string } }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { planId } = params;

  const plan = await prisma.gardenPlan.findUnique({
    where: { id: planId },
    select: { userId: true },
  });

  if (!plan || plan.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.gardenPlan.delete({ where: { id: planId } });

  return NextResponse.json({ success: true });
}
