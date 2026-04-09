// Enums matching Prisma schema
export type Tier = "FREE" | "PRO_MONTHLY" | "PRO_YEARLY" | "ONE_TIME";
export type SubStatus = "NONE" | "ACTIVE" | "PAST_DUE" | "CANCELLED";
export type PlanStatus = "DRAFT" | "GENERATING" | "COMPLETE" | "ARCHIVED";
export type ShapeType = "RECTANGLE" | "ORGANIC" | "L_SHAPE" | "TRIANGLE" | "CUSTOM";
export type SunType = "FULL_SUN" | "PARTIAL_SHADE" | "FULL_SHADE";
export type SoilType = "CLAY" | "SANDY" | "LOAM" | "CHALKY" | "PEATY";
export type PlantRow = "BACK" | "MIDDLE" | "FRONT";
export type CareLevel = "MINIMAL" | "LOW" | "MEDIUM" | "HIGH";
export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";

export type UserTier = Tier;

// User type
export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  tier: Tier;
  subStatus: SubStatus;
  subEndDate: Date | null;
  createdAt: Date;
}

// Plant type (from DB + generated plans)
export interface Plant {
  id?: string;
  commonName: string;
  latinName: string;
  variety?: string | null;
  heightMinCm: number;
  heightMaxCm: number;
  spreadMinCm: number;
  spreadMaxCm: number;
  bloomMonths: number[];
  color: string;
  iconEmoji: string;
  imageUrl?: string | null;
  row: PlantRow;
  isFragrant: boolean;
  beeRating: number;
  sunRequirement: SunType;
  soilPreference: SoilType[];
  climateZones: string[];
  spacingCm: number;
  priceEstimate: number;
  careLevel: CareLevel;
  descriptionEn?: string | null;
  quantity?: number;
}

// Section of a garden (bed zone)
export interface Section {
  id: string;
  label: string;
  row: PlantRow;
  color?: string;
  plants: string[]; // plant commonNames or IDs
  percentageOfBed?: number;
}

// Plant position in the SVG schema
export interface PlantPosition {
  id: string;
  plantName: string;
  plantColor: string;
  plantEmoji: string;
  x: number; // percentage 0-100 of bed length
  y: number; // percentage 0-100 of bed width
  sectionId: string;
  row: PlantRow;
}

// Curve point for organic shapes
export interface CurvePoint {
  position: number; // 0-1 along the length
  width: number; // width in meters at this point
}

// Shopping list item
export interface ShoppingItem {
  plantName: string;
  latinName: string;
  variety?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  emoji: string;
  color: string;
}

// Complete plan data structure (stored in GardenPlan.plantList, sections, plantPositions)
export interface PlanData {
  sections: Section[];
  plants: Plant[];
  plantPositions: PlantPosition[];
  shoppingList: ShoppingItem[];
  gardenSpec: GardenSpec;
  generatedAt: string;
}

// Garden specification
export interface GardenSpec {
  lengthMeters: number;
  widthMeters: number;
  shapeType: ShapeType;
  sunExposure: SunType;
  soilType: SoilType;
  country: string;
  climateZone: string;
  stylePreference?: string;
  colorPreference?: string;
  maintenanceLevel?: "LOW" | "MEDIUM" | "HIGH";
  curvePoints?: CurvePoint[];
  name?: string;
  // For organic/wavy borders: width at the two ends vs. the middle
  widthAtEndsMeters?: number;
  widthAtMiddleMeters?: number;
}

// Garden Plan (matches DB GardenPlan)
export interface GardenPlan {
  id: string;
  userId: string;
  name: string;
  status: PlanStatus;
  lengthMeters: number;
  widthMeters: number | null;
  shapeType: ShapeType;
  shapeData: CurvePoint[] | null;
  sketchUrl: string | null;
  sketchAnalysis: SketchAnalysis | null;
  country: string;
  climateZone: string;
  sunExposure: SunType;
  soilType: SoilType;
  preferences: Record<string, unknown> | null;
  sections: Section[] | null;
  plantPositions: PlantPosition[] | null;
  plantList: PlanData | null;
  isPublic: boolean;
  shareSlug: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Chat message type
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  imageUrl?: string | null;
  metadata?: ChatMessageMetadata | null;
  createdAt: Date;
}

// Message metadata for embedded data
export interface ChatMessageMetadata {
  plants?: Partial<Plant>[];
  planTrigger?: GardenSpec;
  imageAnalysis?: SketchAnalysis;
  isError?: boolean;
}

// Sketch analysis result
export interface SketchAnalysis {
  shapeType: ShapeType;
  estimatedLengthMeters: number | null;
  estimatedWidthMeters: number | null;
  sections: Array<{
    label: string;
    type: "bed" | "path" | "structure" | "tree";
    approximatePosition: "front" | "middle" | "back" | "left" | "right";
  }>;
  existingFeatures: string[];
  annotations: string[];
  confidence: "high" | "medium" | "low";
  notes: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

// Session type extension for next-auth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      tier: Tier;
      subStatus: SubStatus;
    };
  }
}

// Pricing
export interface PricingPlan {
  id: "free" | "monthly" | "yearly" | "onetime";
  name: string;
  price: number;
  currency: string;
  interval?: "month" | "year";
  isPopular?: boolean;
  features: string[];
  limitations: string[];
}
