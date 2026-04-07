import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const climateZone = searchParams.get("climateZone") || "8";
  const sun = searchParams.get("sun");
  const row = searchParams.get("row");
  const search = searchParams.get("search");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    climateZones: { has: climateZone },
  };

  if (sun) where.sunRequirement = sun;
  if (row) where.row = row;
  if (search) {
    where.OR = [
      { commonName: { contains: search, mode: "insensitive" } },
      { latinName: { contains: search, mode: "insensitive" } },
    ];
  }

  const plants = await prisma.plantDatabase.findMany({
    where,
    orderBy: [{ row: "asc" }, { commonName: "asc" }],
    take: 100,
  });

  return NextResponse.json(plants);
}
