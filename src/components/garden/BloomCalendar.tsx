"use client";

import React, { useState } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plant } from "@/types";

interface BloomCalendarProps {
  plants: Plant[];
  isPremium?: boolean;
  className?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SEASON_COLORS: Record<number, string> = {
  1: "#A8C4E0", 2: "#B0CCE5", 3: "#7DB87D",
  4: "#52A852", 5: "#FFD966", 6: "#FFB347",
  7: "#FF8C69", 8: "#FF7043", 9: "#DDA0DD",
  10: "#BA8FC0", 11: "#8B7355", 12: "#9BA8B5",
};

export function BloomCalendar({ plants, isPremium = false, className }: BloomCalendarProps) {
  const [hoveredPlant, setHoveredPlant] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const FREE_MONTHS = 3;

  // Filter plants that have bloom months
  const bloomingPlants = plants.filter((p) => p.bloomMonths && p.bloomMonths.length > 0);

  // Plants blooming in selected month
  const monthPlants = selectedMonth
    ? bloomingPlants.filter((p) => p.bloomMonths.includes(selectedMonth))
    : [];

  if (bloomingPlants.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full text-center p-8", className)}>
        <div>
          <div className="text-4xl mb-3">📅</div>
          <p className="text-sm text-muted-foreground font-body">
            Bloom calendar will appear once your garden plan is generated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Month header with click filter */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2">
        <div className="grid grid-cols-12 gap-0.5">
          {MONTHS.map((month, idx) => {
            const monthNum = idx + 1;
            const isLocked = !isPremium && monthNum > FREE_MONTHS;
            const bloomCount = bloomingPlants.filter((p) => p.bloomMonths.includes(monthNum)).length;

            return (
              <button
                key={month}
                onClick={() => !isLocked && setSelectedMonth(selectedMonth === monthNum ? null : monthNum)}
                disabled={isLocked}
                className={cn(
                  "relative flex flex-col items-center py-1.5 rounded text-center transition-colors",
                  selectedMonth === monthNum
                    ? "bg-garden-green text-white"
                    : isLocked
                    ? "opacity-40 cursor-not-allowed bg-gray-100"
                    : "hover:bg-garden-cream-dark text-garden-forest cursor-pointer"
                )}
              >
                <span className="text-[10px] font-body font-medium">{month}</span>
                {bloomCount > 0 && !isLocked && (
                  <span className={cn(
                    "text-[9px] font-body",
                    selectedMonth === monthNum ? "text-garden-cream/80" : "text-garden-green"
                  )}>
                    {bloomCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto scrollbar-chat px-4 pb-4">
        {selectedMonth && monthPlants.length > 0 && (
          <div className="mb-3 p-3 bg-garden-green/5 rounded-xl border border-garden-green/20">
            <p className="text-xs font-semibold text-garden-green font-body mb-1">
              {MONTHS[selectedMonth - 1]}: {monthPlants.length} plants blooming
            </p>
            <div className="flex flex-wrap gap-1">
              {monthPlants.map((p) => (
                <span
                  key={p.commonName}
                  className="inline-flex items-center gap-1 text-xs bg-white border border-garden-earth-light rounded-full px-2 py-0.5 font-body"
                >
                  {p.iconEmoji} {p.commonName}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          {bloomingPlants.map((plant, plantIdx) => (
            <div
              key={plant.commonName}
              className={cn(
                "flex items-center gap-2 group",
                hoveredPlant === plant.commonName && "bg-garden-cream rounded-lg"
              )}
              onMouseEnter={() => setHoveredPlant(plant.commonName)}
              onMouseLeave={() => setHoveredPlant(null)}
            >
              {/* Plant name */}
              <div className="w-24 flex-shrink-0 flex items-center gap-1 px-1">
                <span className="text-sm">{plant.iconEmoji}</span>
                <span className="text-xs font-body text-garden-forest truncate" title={plant.commonName}>
                  {plant.commonName}
                </span>
              </div>

              {/* Month bars */}
              <div className="flex-1 grid grid-cols-12 gap-0.5">
                {MONTHS.map((_, idx) => {
                  const monthNum = idx + 1;
                  const isBloom = plant.bloomMonths.includes(monthNum);
                  const isLocked = !isPremium && monthNum > FREE_MONTHS;

                  return (
                    <div
                      key={monthNum}
                      className={cn(
                        "h-5 rounded-sm transition-opacity",
                        isLocked ? "relative overflow-hidden" : ""
                      )}
                      style={{
                        backgroundColor: isBloom && !isLocked
                          ? plant.color ?? SEASON_COLORS[monthNum]
                          : isBloom && isLocked
                          ? "#E5E7EB"
                          : "transparent",
                        opacity: isBloom ? 0.85 : 0.1,
                        border: isBloom ? `1px solid ${plant.color ?? SEASON_COLORS[monthNum]}40` : "1px solid transparent",
                      }}
                    >
                      {isLocked && isBloom && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                          <Lock className="w-2.5 h-2.5 text-gray-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!isPremium && (
          <div className="mt-4 flex items-center gap-2 bg-garden-earth/10 border border-garden-earth/30 rounded-xl px-3 py-2.5 text-xs font-body text-garden-earth-dark">
            <Lock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Upgrade to Pro to see the full 12-month bloom calendar</span>
          </div>
        )}
      </div>
    </div>
  );
}
