import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import type { GardenSpec, Plant, Section, PlantPosition, ShoppingItem, PlanData } from "@/types";

// Plant selection algorithm based on garden spec
async function selectPlants(spec: GardenSpec): Promise<Plant[]> {
  const filters: Parameters<typeof prisma.plantDatabase.findMany>[0]["where"] = {
    sunRequirement: spec.sunExposure,
    climateZones: { has: spec.climateZone },
  };

  if (spec.soilType) {
    filters.soilPreference = { has: spec.soilType };
  }

  let plants = await prisma.plantDatabase.findMany({
    where: filters,
    take: 60,
  });

  // Fallback: relax soil constraint
  if (plants.length < 10) {
    plants = await prisma.plantDatabase.findMany({
      where: { sunRequirement: spec.sunExposure },
      take: 60,
    });
  }

  // Fallback: get any plants
  if (plants.length < 10) {
    plants = await prisma.plantDatabase.findMany({ take: 60 });
  }

  // Determine target plant count based on garden area
  const area = spec.lengthMeters * (spec.widthMeters ?? 2);
  const targetCount = Math.min(20, Math.max(8, Math.round(area * 1.5)));

  // Distribute by row: 35% back, 40% middle, 25% front
  const backCount = Math.ceil(targetCount * 0.35);
  const middleCount = Math.ceil(targetCount * 0.40);
  const frontCount = Math.max(2, targetCount - backCount - middleCount);

  const backPlants = plants.filter((p) => p.row === "BACK").slice(0, backCount);
  const middlePlants = plants.filter((p) => p.row === "MIDDLE").slice(0, middleCount);
  const frontPlants = plants.filter((p) => p.row === "FRONT").slice(0, frontCount);

  // Pad if needed
  const allFiltered = plants.filter((p) => !backPlants.includes(p) && !middlePlants.includes(p) && !frontPlants.includes(p));
  const selected = [...backPlants, ...middlePlants, ...frontPlants];

  while (selected.length < targetCount && allFiltered.length > 0) {
    selected.push(allFiltered.shift()!);
  }

  return selected.map((p) => ({
    id: p.id,
    commonName: p.commonName,
    latinName: p.latinName,
    variety: p.variety ?? null,
    heightMinCm: p.heightMinCm,
    heightMaxCm: p.heightMaxCm,
    spreadMinCm: p.spreadMinCm,
    spreadMaxCm: p.spreadMaxCm,
    bloomMonths: p.bloomMonths,
    color: p.color,
    iconEmoji: p.iconEmoji,
    imageUrl: p.imageUrl ?? null,
    row: p.row,
    isFragrant: p.isFragrant,
    beeRating: p.beeRating,
    sunRequirement: p.sunRequirement,
    soilPreference: p.soilPreference,
    climateZones: p.climateZones,
    spacingCm: p.spacingCm,
    priceEstimate: p.priceEstimate,
    careLevel: p.careLevel,
    descriptionEn: p.descriptionEn ?? null,
  }));
}

// Generate sections from selected plants
function generateSections(plants: Plant[]): Section[] {
  const rowGroups: Record<string, Plant[]> = { BACK: [], MIDDLE: [], FRONT: [] };
  plants.forEach((p) => {
    if (p.row in rowGroups) rowGroups[p.row].push(p);
  });

  return Object.entries(rowGroups)
    .filter(([, plants]) => plants.length > 0)
    .map(([row, rowPlants]) => ({
      id: row.toLowerCase(),
      label: row === "BACK" ? "Back Border" : row === "MIDDLE" ? "Mid Border" : "Front Edge",
      row: row as "BACK" | "MIDDLE" | "FRONT",
      plants: rowPlants.map((p) => p.commonName),
      percentageOfBed: row === "BACK" ? 35 : row === "MIDDLE" ? 40 : 25,
    }));
}

// Generate plant positions
function generatePlantPositions(
  plants: Plant[],
  sections: Section[],
  spec: GardenSpec
): PlantPosition[] {
  const positions: PlantPosition[] = [];
  const lengthM = spec.lengthMeters;

  const rowConfig = {
    BACK: { yMin: 0.05, yMax: 0.38 },
    MIDDLE: { yMin: 0.41, yMax: 0.67 },
    FRONT: { yMin: 0.70, yMax: 0.93 },
  };

  const rowPlants: Record<string, Plant[]> = { BACK: [], MIDDLE: [], FRONT: [] };
  plants.forEach((p) => {
    if (p.row in rowPlants) rowPlants[p.row].push(p);
  });

  Object.entries(rowPlants).forEach(([row, rPlants]) => {
    if (rPlants.length === 0) return;
    const { yMin, yMax } = rowConfig[row as keyof typeof rowConfig];
    const section = sections.find((s) => s.row === row);

    const avgSpacingM = rPlants.reduce((s, p) => s + p.spacingCm, 0) / rPlants.length / 100;
    const plantsPerMeter = 1 / avgSpacingM;
    const totalPlantsInRow = Math.round(lengthM * plantsPerMeter);

    const plantRepeats: Plant[] = [];
    let posIdx = 0;
    while (plantRepeats.length < totalPlantsInRow) {
      plantRepeats.push(rPlants[posIdx % rPlants.length]);
      posIdx++;
    }

    plantRepeats.forEach((plant, idx) => {
      const xBase = (idx + 0.5) / plantRepeats.length;
      const xVariation = (Math.random() - 0.5) * (0.8 / plantRepeats.length);
      const yBase = Math.random() * (yMax - yMin) + yMin;

      positions.push({
        id: `${row}-${plant.commonName.replace(/\s+/g, "_")}-${idx}`,
        plantName: plant.commonName,
        plantColor: plant.color ?? "#4A8A32",
        plantEmoji: plant.iconEmoji ?? "🌿",
        x: Math.max(1, Math.min(99, (xBase + xVariation) * 100)),
        y: Math.max(1, Math.min(99, yBase * 100)),
        sectionId: section?.id ?? row.toLowerCase(),
        row: row as "BACK" | "MIDDLE" | "FRONT",
      });
    });
  });

  return positions;
}

// Generate shopping list
function generateShoppingList(plants: Plant[], spec: GardenSpec): ShoppingItem[] {
  const lengthM = spec.lengthMeters;

  return plants.map((plant) => {
    const spacingM = plant.spacingCm / 100;
    const rowWidth = lengthM;
    const quantity = Math.max(1, Math.round(rowWidth / spacingM));

    return {
      plantName: plant.commonName,
      latinName: plant.latinName,
      variety: plant.variety ?? undefined,
      quantity,
      unit: "plants",
      unitPrice: plant.priceEstimate ?? 4.99,
      totalPrice: quantity * (plant.priceEstimate ?? 4.99),
      emoji: plant.iconEmoji ?? "🌿",
      color: plant.color ?? "#4A8A32",
    };
  });
}

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
    // Select plants based on spec
    const plants = await selectPlants(gardenSpec);

    if (plants.length === 0) {
      return NextResponse.json({ error: "No plants found for the given spec" }, { status: 404 });
    }

    const sections = generateSections(plants);
    const plantPositions = generatePlantPositions(plants, sections, gardenSpec);
    const shoppingList = generateShoppingList(plants, gardenSpec);

    const planData: PlanData = {
      sections,
      plants,
      plantPositions,
      shoppingList,
      gardenSpec,
      generatedAt: new Date().toISOString(),
    };

    // Create or update the plan in DB
    let plan;
    if (sessionId) {
      const existingSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { plan: true },
      });

      if (existingSession?.planId) {
        plan = await prisma.gardenPlan.update({
          where: { id: existingSession.planId },
          data: {
            status: "COMPLETE",
            name: gardenSpec.name ?? "My Garden",
            lengthMeters: gardenSpec.lengthMeters,
            widthMeters: gardenSpec.widthMeters,
            shapeType: gardenSpec.shapeType,
            sunExposure: gardenSpec.sunExposure,
            soilType: gardenSpec.soilType,
            country: gardenSpec.country ?? "BE",
            climateZone: gardenSpec.climateZone ?? "8",
            sections: sections as unknown as import("@prisma/client").Prisma.InputJsonValue,
            plantPositions: plantPositions as unknown as import("@prisma/client").Prisma.InputJsonValue,
            plantList: planData as unknown as import("@prisma/client").Prisma.InputJsonValue,
            shareSlug: generateSlug(gardenSpec.name ?? "my-garden") + "-" + Date.now().toString(36),
          },
        });
      } else {
        plan = await prisma.gardenPlan.create({
          data: {
            userId,
            name: gardenSpec.name ?? "My Garden",
            status: "COMPLETE",
            lengthMeters: gardenSpec.lengthMeters,
            widthMeters: gardenSpec.widthMeters ?? 2,
            shapeType: gardenSpec.shapeType ?? "RECTANGLE",
            sunExposure: gardenSpec.sunExposure ?? "FULL_SUN",
            soilType: gardenSpec.soilType ?? "LOAM",
            country: gardenSpec.country ?? "BE",
            climateZone: gardenSpec.climateZone ?? "8",
            sections: sections as unknown as import("@prisma/client").Prisma.InputJsonValue,
            plantPositions: plantPositions as unknown as import("@prisma/client").Prisma.InputJsonValue,
            plantList: planData as unknown as import("@prisma/client").Prisma.InputJsonValue,
            shareSlug: generateSlug(gardenSpec.name ?? "my-garden") + "-" + Date.now().toString(36),
          },
        });

        // Link to session
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { planId: plan.id },
        });
      }
    } else {
      plan = await prisma.gardenPlan.create({
        data: {
          userId,
          name: gardenSpec.name ?? "My Garden",
          status: "COMPLETE",
          lengthMeters: gardenSpec.lengthMeters,
          widthMeters: gardenSpec.widthMeters ?? 2,
          shapeType: gardenSpec.shapeType ?? "RECTANGLE",
          sunExposure: gardenSpec.sunExposure ?? "FULL_SUN",
          soilType: gardenSpec.soilType ?? "LOAM",
          country: gardenSpec.country ?? "BE",
          climateZone: gardenSpec.climateZone ?? "8",
          sections: sections as unknown as import("@prisma/client").Prisma.InputJsonValue,
          plantPositions: plantPositions as unknown as import("@prisma/client").Prisma.InputJsonValue,
          plantList: planData as unknown as import("@prisma/client").Prisma.InputJsonValue,
          shareSlug: generateSlug(gardenSpec.name ?? "my-garden") + "-" + Date.now().toString(36),
        },
      });
    }

    return NextResponse.json({ plan, planData });
  } catch (error) {
    console.error("Plan generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}
