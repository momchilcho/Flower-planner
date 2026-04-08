import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import type { GardenSpec, Plant, Section, PlantPosition, ShoppingItem, PlanData } from "@/types";

// ─── Hardcoded fallback plants (used when PlantDatabase is empty) ──────────────
const FALLBACK_PLANTS: Plant[] = [
  // BACK row
  { commonName: "Verbena bonariensis", latinName: "Verbena bonariensis", heightMinCm: 100, heightMaxCm: 150, spreadMinCm: 40, spreadMaxCm: 60, bloomMonths: [6,7,8,9,10], color: "#9B59B6", iconEmoji: "💜", row: "BACK", isFragrant: false, beeRating: 5, sunRequirement: "FULL_SUN", soilPreference: ["LOAM","SANDY","CLAY"], climateZones: ["6","7","8","9"], spacingCm: 45, priceEstimate: 4.99, careLevel: "LOW" },
  { commonName: "Echinacea purpurea", latinName: "Echinacea purpurea", heightMinCm: 80, heightMaxCm: 120, spreadMinCm: 40, spreadMaxCm: 60, bloomMonths: [7,8,9], color: "#E91E8C", iconEmoji: "🌸", row: "BACK", isFragrant: false, beeRating: 5, sunRequirement: "FULL_SUN", soilPreference: ["LOAM","SANDY","CLAY"], climateZones: ["3","4","5","6","7","8","9"], spacingCm: 50, priceEstimate: 5.99, careLevel: "LOW" },
  { commonName: "Rudbeckia 'Goldsturm'", latinName: "Rudbeckia fulgida", heightMinCm: 60, heightMaxCm: 90, spreadMinCm: 40, spreadMaxCm: 60, bloomMonths: [7,8,9,10], color: "#F59E0B", iconEmoji: "🌻", row: "BACK", isFragrant: false, beeRating: 4, sunRequirement: "FULL_SUN", soilPreference: ["LOAM","CLAY","SANDY"], climateZones: ["4","5","6","7","8","9"], spacingCm: 45, priceEstimate: 4.99, careLevel: "LOW" },
  { commonName: "Helenium 'Moerheim Beauty'", latinName: "Helenium autumnale", heightMinCm: 80, heightMaxCm: 100, spreadMinCm: 50, spreadMaxCm: 70, bloomMonths: [7,8,9], color: "#DC2626", iconEmoji: "🌺", row: "BACK", isFragrant: false, beeRating: 5, sunRequirement: "FULL_SUN", soilPreference: ["LOAM","CLAY"], climateZones: ["4","5","6","7","8"], spacingCm: 50, priceEstimate: 5.99, careLevel: "MEDIUM" },
  { commonName: "Phlox paniculata", latinName: "Phlox paniculata", heightMinCm: 70, heightMaxCm: 100, spreadMinCm: 50, spreadMaxCm: 70, bloomMonths: [7,8,9], color: "#F472B6", iconEmoji: "🌷", row: "BACK", isFragrant: true, beeRating: 4, sunRequirement: "FULL_SUN", soilPreference: ["LOAM","CLAY"], climateZones: ["4","5","6","7","8"], spacingCm: 60, priceEstimate: 5.99, careLevel: "MEDIUM" },
  { commonName: "Astilbe 'Fanal'", latinName: "Astilbe x arendsii", heightMinCm: 50, heightMaxCm: 70, spreadMinCm: 40, spreadMaxCm: 60, bloomMonths: [6,7], color: "#DC2626", iconEmoji: "🌿", row: "BACK", isFragrant: false, beeRating: 3, sunRequirement: "PARTIAL_SHADE", soilPreference: ["LOAM","CLAY","PEATY"], climateZones: ["4","5","6","7","8"], spacingCm: 50, priceEstimate: 5.99, careLevel: "LOW" },
  { commonName: "Persicaria amplexicaulis", latinName: "Persicaria amplexicaulis", heightMinCm: 80, heightMaxCm: 120, spreadMinCm: 60, spreadMaxCm: 90, bloomMonths: [6,7,8,9,10], color: "#DC2626", iconEmoji: "🌱", row: "BACK", isFragrant: false, beeRating: 4, sunRequirement: "PARTIAL_SHADE", soilPreference: ["LOAM","CLAY"], climateZones: ["4","5","6","7","8","9"], spacingCm: 70, priceEstimate: 6.99, careLevel: "LOW" },
  { commonName: "Sanguisorba officinalis", latinName: "Sanguisorba officinalis", heightMinCm: 80, heightMaxCm: 120, spreadMinCm: 50, spreadMaxCm: 70, bloomMonths: [6,7,8], color: "#7C2D12", iconEmoji: "🍂", row: "BACK", isFragrant: false, beeRating: 4, sunRequirement: "FULL_SUN", soilPreference: ["LOAM","CLAY"], climateZones: ["4","5","6","7","8"], spacingCm: 60, priceEstimate: 5.99, careLevel: "LOW" },

  // MIDDLE row
  { commonName: "Lavender 'Hidcote'", latinName: "Lavandula angustifolia", heightMinCm: 40, heightMaxCm: 60, spreadMinCm: 40, spreadMaxCm: 60, bloomMonths: [6,7,8], color: "#7C3AED", iconEmoji: "💜", row: "MIDDLE", isFragrant: true, beeRating: 5, sunRequirement: "FULL_SUN", soilPreference: ["SANDY","LOAM","CHALKY"], climateZones: ["5","6","7","8","9"], spacingCm: 40, priceEstimate: 4.49, careLevel: "LOW" },
  { commonName: "Salvia nemorosa", latinName: "Salvia nemorosa", heightMinCm: 40, heightMaxCm: 60, spreadMinCm: 30, spreadMaxCm: 50, bloomMonths: [5,6,7,8], color: "#6D28D9", iconEmoji: "💜", row: "MIDDLE", isFragrant: true, beeRating: 5, sunRequirement: "FULL_SUN", soilPreference: ["LOAM","SANDY","CHALKY"], climateZones: ["5","6","7","8","9"], spacingCm: 35, priceEstimate: 3.99, careLevel: "LOW" },
  { commonName: "Geranium 'Rozanne'", latinName: "Geranium x hybridum", heightMinCm: 30, heightMaxCm: 50, spreadMinCm: 60, spreadMaxCm: 90, bloomMonths: [5,6,7,8,9,10], color: "#6D28D9", iconEmoji: "🌸", row: "MIDDLE", isFragrant: false, beeRating: 4, sunRequirement: "FULL_SUN", soilPreference: ["LOAM","CLAY","SANDY"], climateZones: ["5","6","7","8","9"], spacingCm: 50, priceEstimate: 4.99, careLevel: "LOW" },
  { commonName: "Agastache 'Blue Fortune'", latinName: "Agastache foeniculum", heightMinCm: 60, heightMaxCm: 90, spreadMinCm: 40, spreadMaxCm: 60, bloomMonths: [7,8,9], color: "#7C3AED", iconEmoji: "💜", row: "MIDDLE", isFragrant: true, beeRating: 5, sunRequirement: "FULL_SUN", soilPreference: ["LOAM","SANDY"], climateZones: ["6","7","8","9"], spacingCm: 45, priceEstimate: 4.99, careLevel: "LOW" },
  { commonName: "Knautia macedonica", latinName: "Knautia macedonica", heightMinCm: 50, heightMaxCm: 80, spreadMinCm: 40, spreadMaxCm: 60, bloomMonths: [6,7,8,9], color: "#DC2626", iconEmoji: "🌸", row: "MIDDLE", isFragrant: false, beeRating: 5, sunRequirement: "FULL_SUN", soilPreference: ["LOAM","SANDY","CHALKY"], climateZones: ["5","6","7","8"], spacingCm: 40, priceEstimate: 3.99, careLevel: "LOW" },
  { commonName: "Leucanthemum 'Wirral Supreme'", latinName: "Leucanthemum x superbum", heightMinCm: 60, heightMaxCm: 90, spreadMinCm: 50, spreadMaxCm: 70, bloomMonths: [6,7,8], color: "#FAFAFA", iconEmoji: "🌼", row: "MIDDLE", isFragrant: false, beeRating: 4, sunRequirement: "FULL_SUN", soilPreference: ["LOAM","SANDY","CLAY"], climateZones: ["5","6","7","8"], spacingCm: 45, priceEstimate: 3.99, careLevel: "LOW" },
  { commonName: "Digitalis purpurea", latinName: "Digitalis purpurea", heightMinCm: 80, heightMaxCm: 120, spreadMinCm: 30, spreadMaxCm: 50, bloomMonths: [5,6,7], color: "#C026D3", iconEmoji: "🌿", row: "MIDDLE", isFragrant: false, beeRating: 4, sunRequirement: "PARTIAL_SHADE", soilPreference: ["LOAM","CLAY","PEATY"], climateZones: ["4","5","6","7","8"], spacingCm: 40, priceEstimate: 2.99, careLevel: "LOW" },
  { commonName: "Nepeta x faassenii", latinName: "Nepeta x faassenii", heightMinCm: 40, heightMaxCm: 60, spreadMinCm: 50, spreadMaxCm: 80, bloomMonths: [5,6,7,8,9], color: "#818CF8", iconEmoji: "🌸", row: "MIDDLE", isFragrant: true, beeRating: 5, sunRequirement: "FULL_SUN", soilPreference: ["LOAM","SANDY","CHALKY"], climateZones: ["4","5","6","7","8","9"], spacingCm: 45, priceEstimate: 3.49, careLevel: "LOW" },
  { commonName: "Penstemon 'Husker Red'", latinName: "Penstemon digitalis", heightMinCm: 60, heightMaxCm: 80, spreadMinCm: 30, spreadMaxCm: 50, bloomMonths: [6,7,8], color: "#F9A8D4", iconEmoji: "🌸", row: "MIDDLE", isFragrant: false, beeRating: 4, sunRequirement: "FULL_SUN", soilPreference: ["LOAM","SANDY"], climateZones: ["3","4","5","6","7","8"], spacingCm: 40, priceEstimate: 4.99, careLevel: "LOW" },

  // FRONT row
  { commonName: "Lavandula 'Walker's Low'", latinName: "Nepeta racemosa", heightMinCm: 30, heightMaxCm: 45, spreadMinCm: 60, spreadMaxCm: 90, bloomMonths: [5,6,7,8,9], color: "#818CF8", iconEmoji: "💙", row: "FRONT", isFragrant: true, beeRating: 5, sunRequirement: "FULL_SUN", soilPreference: ["LOAM","SANDY","CHALKY"], climateZones: ["4","5","6","7","8","9"], spacingCm: 45, priceEstimate: 3.49, careLevel: "LOW" },
  { commonName: "Stachys byzantina", latinName: "Stachys byzantina", heightMinCm: 20, heightMaxCm: 40, spreadMinCm: 40, spreadMaxCm: 60, bloomMonths: [6,7], color: "#C4B5FD", iconEmoji: "🪨", row: "FRONT", isFragrant: false, beeRating: 3, sunRequirement: "FULL_SUN", soilPreference: ["SANDY","LOAM","CHALKY"], climateZones: ["4","5","6","7","8","9"], spacingCm: 30, priceEstimate: 2.99, careLevel: "MINIMAL" },
  { commonName: "Alchemilla mollis", latinName: "Alchemilla mollis", heightMinCm: 20, heightMaxCm: 40, spreadMinCm: 40, spreadMaxCm: 60, bloomMonths: [5,6,7], color: "#86EFAC", iconEmoji: "🌿", row: "FRONT", isFragrant: false, beeRating: 3, sunRequirement: "PARTIAL_SHADE", soilPreference: ["LOAM","CLAY"], climateZones: ["4","5","6","7","8"], spacingCm: 35, priceEstimate: 3.49, careLevel: "LOW" },
  { commonName: "Heuchera 'Palace Purple'", latinName: "Heuchera micrantha", heightMinCm: 25, heightMaxCm: 45, spreadMinCm: 30, spreadMaxCm: 50, bloomMonths: [5,6,7], color: "#7F1D1D", iconEmoji: "🍁", row: "FRONT", isFragrant: false, beeRating: 3, sunRequirement: "PARTIAL_SHADE", soilPreference: ["LOAM","CLAY"], climateZones: ["4","5","6","7","8","9"], spacingCm: 35, priceEstimate: 4.49, careLevel: "LOW" },
  { commonName: "Dianthus deltoides", latinName: "Dianthus deltoides", heightMinCm: 15, heightMaxCm: 30, spreadMinCm: 30, spreadMaxCm: 50, bloomMonths: [5,6,7,8], color: "#F43F5E", iconEmoji: "🌸", row: "FRONT", isFragrant: true, beeRating: 4, sunRequirement: "FULL_SUN", soilPreference: ["SANDY","LOAM","CHALKY"], climateZones: ["4","5","6","7","8"], spacingCm: 25, priceEstimate: 2.99, careLevel: "LOW" },
  { commonName: "Vinca minor", latinName: "Vinca minor", heightMinCm: 15, heightMaxCm: 20, spreadMinCm: 60, spreadMaxCm: 120, bloomMonths: [3,4,5,6], color: "#818CF8", iconEmoji: "🌿", row: "FRONT", isFragrant: false, beeRating: 3, sunRequirement: "FULL_SHADE", soilPreference: ["LOAM","CLAY","SANDY"], climateZones: ["4","5","6","7","8","9"], spacingCm: 40, priceEstimate: 2.49, careLevel: "MINIMAL" },
  { commonName: "Sedum 'Autumn Joy'", latinName: "Hylotelephium spectabile", heightMinCm: 30, heightMaxCm: 50, spreadMinCm: 40, spreadMaxCm: 60, bloomMonths: [8,9,10], color: "#F87171", iconEmoji: "🌸", row: "FRONT", isFragrant: false, beeRating: 5, sunRequirement: "FULL_SUN", soilPreference: ["LOAM","SANDY","CHALKY"], climateZones: ["3","4","5","6","7","8","9"], spacingCm: 35, priceEstimate: 3.99, careLevel: "MINIMAL" },
];

// ─── Plant selection ──────────────────────────────────────────────────────────
export async function selectPlants(spec: GardenSpec): Promise<Plant[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: any = { sunRequirement: spec.sunExposure };
  if (spec.soilType) filters.soilPreference = { has: spec.soilType };

  let dbPlants = await prisma.plantDatabase.findMany({ where: filters, take: 60 });

  if (dbPlants.length < 5) {
    dbPlants = await prisma.plantDatabase.findMany({ where: { sunRequirement: spec.sunExposure }, take: 60 });
  }
  if (dbPlants.length < 5) {
    dbPlants = await prisma.plantDatabase.findMany({ take: 60 });
  }

  // Map DB plants to our Plant type
  const mapped: Plant[] = dbPlants.map((p) => ({
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
    row: p.row as Plant["row"],
    isFragrant: p.isFragrant,
    beeRating: p.beeRating,
    sunRequirement: p.sunRequirement as Plant["sunRequirement"],
    soilPreference: p.soilPreference as Plant["soilPreference"],
    climateZones: p.climateZones,
    spacingCm: p.spacingCm,
    priceEstimate: p.priceEstimate ?? 4.99,
    careLevel: p.careLevel as Plant["careLevel"],
    descriptionEn: p.descriptionEn ?? null,
  }));

  // Fall back to hardcoded plants if DB is empty
  const sourcePlants = mapped.length >= 5 ? mapped : filterFallbackPlants(spec);

  return distributeByRow(sourcePlants, spec);
}

function filterFallbackPlants(spec: GardenSpec): Plant[] {
  // Try to match sun exposure from fallback list
  const sunMatch = FALLBACK_PLANTS.filter((p) => p.sunRequirement === spec.sunExposure);
  return sunMatch.length >= 8 ? sunMatch : FALLBACK_PLANTS;
}

function distributeByRow(plants: Plant[], spec: GardenSpec): Plant[] {
  const area = spec.lengthMeters * (spec.widthMeters ?? 2);
  const targetCount = Math.min(20, Math.max(8, Math.round(area * 1.5)));

  const backCount = Math.ceil(targetCount * 0.35);
  const middleCount = Math.ceil(targetCount * 0.40);
  const frontCount = Math.max(2, targetCount - backCount - middleCount);

  const back = plants.filter((p) => p.row === "BACK").slice(0, backCount);
  const middle = plants.filter((p) => p.row === "MIDDLE").slice(0, middleCount);
  const front = plants.filter((p) => p.row === "FRONT").slice(0, frontCount);

  const used = new Set([...back, ...middle, ...front]);
  const rest = plants.filter((p) => !used.has(p));
  const selected = [...back, ...middle, ...front];

  while (selected.length < targetCount && rest.length > 0) {
    selected.push(rest.shift()!);
  }

  // If still short (e.g. very small DB), pad from fallback
  if (selected.length < 5) {
    const fallback = filterFallbackPlants(spec);
    for (const p of fallback) {
      if (!selected.find((s) => s.commonName === p.commonName)) selected.push(p);
      if (selected.length >= targetCount) break;
    }
  }

  return selected;
}

// ─── Plan data generation ─────────────────────────────────────────────────────
export function generateSections(plants: Plant[]): Section[] {
  const rowGroups: Record<string, Plant[]> = { BACK: [], MIDDLE: [], FRONT: [] };
  plants.forEach((p) => { if (p.row in rowGroups) rowGroups[p.row].push(p); });

  return Object.entries(rowGroups)
    .filter(([, rp]) => rp.length > 0)
    .map(([row, rp]) => ({
      id: row.toLowerCase(),
      label: row === "BACK" ? "Back Border" : row === "MIDDLE" ? "Mid Border" : "Front Edge",
      row: row as "BACK" | "MIDDLE" | "FRONT",
      plants: rp.map((p) => p.commonName),
      percentageOfBed: row === "BACK" ? 35 : row === "MIDDLE" ? 40 : 25,
    }));
}

export function generatePlantPositions(plants: Plant[], sections: Section[], spec: GardenSpec): PlantPosition[] {
  const positions: PlantPosition[] = [];
  const lengthM = spec.lengthMeters;

  const rowConfig = {
    BACK:   { yMin: 0.05, yMax: 0.38 },
    MIDDLE: { yMin: 0.41, yMax: 0.67 },
    FRONT:  { yMin: 0.70, yMax: 0.93 },
  };

  const rowPlants: Record<string, Plant[]> = { BACK: [], MIDDLE: [], FRONT: [] };
  plants.forEach((p) => { if (p.row in rowPlants) rowPlants[p.row].push(p); });

  Object.entries(rowPlants).forEach(([row, rp]) => {
    if (rp.length === 0) return;
    const { yMin, yMax } = rowConfig[row as keyof typeof rowConfig];
    const section = sections.find((s) => s.row === row);

    const avgSpacingM = rp.reduce((s, p) => s + p.spacingCm, 0) / rp.length / 100;
    const totalInRow = Math.max(rp.length, Math.round(lengthM / avgSpacingM));

    const repeats: Plant[] = [];
    let idx = 0;
    while (repeats.length < totalInRow) { repeats.push(rp[idx % rp.length]); idx++; }

    repeats.forEach((plant, i) => {
      const xBase = (i + 0.5) / repeats.length;
      const xVariation = (Math.random() - 0.5) * (0.8 / repeats.length);
      const yBase = Math.random() * (yMax - yMin) + yMin;

      positions.push({
        id: `${row}-${plant.commonName.replace(/\s+/g, "_")}-${i}`,
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

export function generateShoppingList(plants: Plant[], spec: GardenSpec): ShoppingItem[] {
  const lengthM = spec.lengthMeters;
  return plants.map((plant) => {
    const spacingM = plant.spacingCm / 100;
    const quantity = Math.max(1, Math.round(lengthM / spacingM));
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

// ─── Full plan creation (DB write) ───────────────────────────────────────────
export async function createOrUpdatePlan(
  gardenSpec: GardenSpec,
  userId: string,
  sessionId?: string
): Promise<{ id: string; planData: PlanData }> {
  const plants = await selectPlants(gardenSpec);
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

  const commonFields = {
    name: gardenSpec.name ?? "My Garden",
    status: "COMPLETE" as const,
    lengthMeters: gardenSpec.lengthMeters,
    widthMeters: gardenSpec.widthMeters ?? 2,
    shapeType: (gardenSpec.shapeType ?? "RECTANGLE") as import("@prisma/client").ShapeType,
    sunExposure: (gardenSpec.sunExposure ?? "FULL_SUN") as import("@prisma/client").SunType,
    soilType: (gardenSpec.soilType ?? "LOAM") as import("@prisma/client").SoilType,
    country: gardenSpec.country ?? "BE",
    climateZone: gardenSpec.climateZone ?? "8",
    sections: sections as unknown as import("@prisma/client").Prisma.InputJsonValue,
    plantPositions: plantPositions as unknown as import("@prisma/client").Prisma.InputJsonValue,
    plantList: planData as unknown as import("@prisma/client").Prisma.InputJsonValue,
    shareSlug: generateSlug(gardenSpec.name ?? "my-garden") + "-" + Date.now().toString(36),
  };

  let plan;

  if (sessionId) {
    const existingSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { plan: true },
    });

    if (existingSession?.planId) {
      plan = await prisma.gardenPlan.update({
        where: { id: existingSession.planId },
        data: commonFields,
      });
    } else {
      plan = await prisma.gardenPlan.create({ data: { userId, ...commonFields } });
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { planId: plan.id },
      });
    }
  } else {
    plan = await prisma.gardenPlan.create({ data: { userId, ...commonFields } });
  }

  return { id: plan.id, planData };
}
