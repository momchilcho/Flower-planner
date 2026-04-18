import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("perPage") ?? "20") || 20));

  const [plans, total] = await Promise.all([
    prisma.gardenPlan.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        status: true,
        lengthMeters: true,
        widthMeters: true,
        shapeType: true,
        country: true,
        sunExposure: true,
        soilType: true,
        isPublic: true,
        shareSlug: true,
        createdAt: true,
        updatedAt: true,
        chatSession: { select: { id: true } },
      },
    }),
    prisma.gardenPlan.count({ where: { userId } }),
  ]);

  return NextResponse.json({
    plans,
    total,
    page,
    perPage,
    hasMore: page * perPage < total,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  const plan = await prisma.gardenPlan.create({
    data: {
      userId,
      name: body.name ?? "My Garden",
      lengthMeters: body.lengthMeters ?? 4,
      widthMeters: body.widthMeters ?? 2,
      shapeType: body.shapeType ?? "RECTANGLE",
      country: body.country ?? "BE",
      climateZone: body.climateZone ?? "8",
      sunExposure: body.sunExposure ?? "FULL_SUN",
      soilType: body.soilType ?? "LOAM",
      preferences: body.preferences ?? {},
    },
  });

  return NextResponse.json({ plan }, { status: 201 });
}
