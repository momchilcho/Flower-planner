"use client";

import React from "react";
import { getMonthName } from "@/lib/utils";
import type { Plant } from "@/types";

interface PlantCardProps {
  plant: Partial<Plant>;
  compact?: boolean;
}

export function PlantCard({ plant, compact = false }: PlantCardProps) {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-white border border-garden-earth-light rounded-full px-3 py-1 text-sm font-body">
        <span>{plant.iconEmoji ?? "🌿"}</span>
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white"
          style={{ backgroundColor: plant.color ?? "#4A8A32" }}
        />
        <span className="font-medium text-garden-forest">{plant.commonName}</span>
      </span>
    );
  }

  const beeRating = plant.beeRating ?? 3;
  const bloomLabel = plant.bloomMonths?.length
    ? plant.bloomMonths.length === 12
      ? "Year-round"
      : `${getMonthName(plant.bloomMonths[0], true)} – ${getMonthName(plant.bloomMonths[plant.bloomMonths.length - 1], true)}`
    : null;

  return (
    <div className="flex items-start gap-3 bg-white rounded-xl border border-garden-earth-light p-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Color + emoji */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xl"
        style={{ backgroundColor: plant.color ? plant.color + "22" : "#4A8A3222" }}
      >
        {plant.iconEmoji ?? "🌿"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-garden-forest font-body">{plant.commonName}</span>
          {plant.row && (
            <span className={`text-xs px-1.5 py-0.5 rounded font-body ${
              plant.row === "BACK" ? "bg-garden-green/10 text-garden-green" :
              plant.row === "MIDDLE" ? "bg-garden-earth/10 text-garden-earth-dark" :
              "bg-garden-pink/10 text-garden-pink-dark"
            }`}>
              {plant.row.toLowerCase()}
            </span>
          )}
        </div>

        {plant.latinName && (
          <p className="text-xs text-muted-foreground italic font-body">{plant.latinName}</p>
        )}

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {/* Color swatch */}
          {plant.color && (
            <div className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: plant.color }}
              />
              <span className="text-xs text-muted-foreground font-mono">{plant.color}</span>
            </div>
          )}

          {/* Bloom months */}
          {bloomLabel && (
            <span className="text-xs text-garden-green font-body">🌸 {bloomLabel}</span>
          )}

          {/* Bee rating */}
          {beeRating > 0 && (
            <span className="text-xs font-body" title={`Bee rating: ${beeRating}/5`}>
              {"🐝".repeat(Math.min(beeRating, 5))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
