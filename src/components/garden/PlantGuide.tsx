"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, getMonthName } from "@/lib/utils";
import type { Plant } from "@/types";

interface PlantGuideProps {
  plants: Plant[];
  isPremium?: boolean;
  className?: string;
}

function BeeRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" title={`Bee rating: ${rating}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "text-yellow-500" : "text-gray-200"} style={{ fontSize: "12px" }}>
          🐝
        </span>
      ))}
    </div>
  );
}

function BloomDots({ months }: { months: number[] }) {
  return (
    <div className="flex gap-0.5 flex-wrap">
      {Array.from({ length: 12 }).map((_, i) => {
        const monthNum = i + 1;
        const isBloom = months.includes(monthNum);
        return (
          <div
            key={monthNum}
            title={getMonthName(monthNum)}
            className={cn(
              "w-3 h-3 rounded-full border",
              isBloom ? "bg-garden-green border-garden-green" : "bg-gray-100 border-gray-200"
            )}
          />
        );
      })}
    </div>
  );
}

function PlantCard({ plant, expanded, onToggle }: { plant: Plant; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-garden-earth-light overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: (plant.color ?? "#4A8A32") + "22" }}
            >
              {plant.iconEmoji ?? "🌿"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-garden-forest font-body text-sm">{plant.commonName}</h3>
                <Badge
                  variant={plant.row === "BACK" ? "default" : plant.row === "MIDDLE" ? "secondary" : "cream"}
                  className="text-[10px] px-1.5 py-0"
                >
                  {plant.row?.toLowerCase()}
                </Badge>
                {plant.isFragrant && (
                  <span className="text-xs" title="Fragrant">🌸</span>
                )}
              </div>
              {plant.latinName && (
                <p className="text-xs italic text-muted-foreground font-body">{plant.latinName}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="w-3 h-3 rounded-full border border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: plant.color ?? "#4A8A32" }}
                />
                <BeeRating rating={plant.beeRating ?? 3} />
              </div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-garden-cream-dark text-muted-foreground hover:text-garden-forest transition-colors flex-shrink-0"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-body">
          <div className="bg-garden-cream rounded-lg p-2">
            <span className="text-muted-foreground">Height</span>
            <p className="font-medium text-garden-forest">{plant.heightMinCm}–{plant.heightMaxCm} cm</p>
          </div>
          <div className="bg-garden-cream rounded-lg p-2">
            <span className="text-muted-foreground">Spread</span>
            <p className="font-medium text-garden-forest">{plant.spreadMinCm}–{plant.spreadMaxCm} cm</p>
          </div>
          <div className="bg-garden-cream rounded-lg p-2">
            <span className="text-muted-foreground">Spacing</span>
            <p className="font-medium text-garden-forest">{plant.spacingCm} cm</p>
          </div>
          <div className="bg-garden-cream rounded-lg p-2">
            <span className="text-muted-foreground">Care</span>
            <p className="font-medium text-garden-forest capitalize">{plant.careLevel?.toLowerCase() ?? "low"}</p>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xs text-muted-foreground font-body mb-1.5">Bloom months</p>
          <BloomDots months={plant.bloomMonths ?? []} />
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-garden-earth-light/50 mt-0 pt-3 space-y-2">
          {plant.descriptionEn && (
            <p className="text-xs text-garden-forest/80 font-body leading-relaxed">{plant.descriptionEn}</p>
          )}
          <div className="flex flex-wrap gap-1.5 text-xs font-body">
            {plant.sunRequirement && (
              <span className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-2 py-0.5 rounded-full">
                {plant.sunRequirement === "FULL_SUN" ? "☀️ Full sun" : plant.sunRequirement === "PARTIAL_SHADE" ? "⛅ Partial shade" : "🌑 Full shade"}
              </span>
            )}
            {plant.soilPreference?.map((soil) => (
              <span key={soil} className="bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full capitalize">
                {soil.toLowerCase()}
              </span>
            ))}
            {plant.priceEstimate && (
              <span className="bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full">
                ~€{plant.priceEstimate.toFixed(2)}/plant
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PlantGuide({ plants, isPremium = false, className }: PlantGuideProps) {
  const [expandedPlant, setExpandedPlant] = useState<string | null>(null);

  const FREE_PLANTS = 3;
  const visiblePlants = isPremium ? plants : plants.slice(0, FREE_PLANTS);
  const lockedCount = isPremium ? 0 : Math.max(0, plants.length - FREE_PLANTS);

  if (plants.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full text-center p-8", className)}>
        <div>
          <div className="text-4xl mb-3">🌿</div>
          <p className="text-sm text-muted-foreground font-body">
            Plant guide will appear once your garden plan is generated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="px-4 py-2 border-b border-garden-earth-light flex-shrink-0">
        <p className="text-sm font-body text-muted-foreground">
          <span className="font-semibold text-garden-forest">{plants.length} plants</span> in your garden plan
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-chat p-4 space-y-3">
        {visiblePlants.map((plant) => (
          <PlantCard
            key={plant.commonName}
            plant={plant}
            expanded={expandedPlant === plant.commonName}
            onToggle={() => setExpandedPlant(
              expandedPlant === plant.commonName ? null : plant.commonName
            )}
          />
        ))}

        {lockedCount > 0 && (
          <div className="text-center py-4 bg-gradient-to-b from-transparent to-garden-cream">
            <div className="bg-white rounded-xl border border-garden-earth-light p-4 shadow-sm">
              <Lock className="w-6 h-6 text-garden-green mx-auto mb-2" />
              <p className="text-sm font-semibold text-garden-forest font-body mb-1">
                +{lockedCount} more plants
              </p>
              <p className="text-xs text-muted-foreground font-body mb-3">
                Upgrade to Pro to see all plant details, care guides, and sourcing information.
              </p>
              <Link href="/pricing">
                <Button variant="garden" size="sm" className="w-full">
                  Unlock All Plants
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
