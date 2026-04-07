"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GardenPlan, Plant, Section, PlantPosition, CurvePoint } from "@/types";

interface GardenSchemaProps {
  plan: GardenPlan;
  isPremium?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

interface Tooltip {
  x: number;
  y: number;
  plant: Plant | null;
  position: PlantPosition;
}

// Generate an organic SVG path for border shapes
function generateOrganicPath(
  lengthM: number,
  widthM: number,
  curvePoints: CurvePoint[],
  svgWidth: number,
  svgHeight: number
): string {
  if (!curvePoints || curvePoints.length === 0) {
    // Fall back to rectangle
    return `M 0 0 L ${svgWidth} 0 L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;
  }

  const pixelsPerMeterX = svgWidth / lengthM;
  const pixelsPerMeterY = svgHeight / widthM;

  // Top edge (straight)
  let path = `M 0 0 L ${svgWidth} 0`;

  // Right edge
  path += ` L ${svgWidth} ${svgHeight}`;

  // Bottom edge (curved based on curvePoints)
  const bottomPoints = curvePoints.map((cp) => ({
    x: cp.position * svgWidth,
    y: svgHeight - (cp.width / widthM) * svgHeight * 0.3,
  }));

  if (bottomPoints.length > 0) {
    path += ` L ${bottomPoints[bottomPoints.length - 1].x} ${bottomPoints[bottomPoints.length - 1].y}`;
    for (let i = bottomPoints.length - 2; i >= 0; i--) {
      path += ` L ${bottomPoints[i].x} ${bottomPoints[i].y}`;
    }
  }

  path += " Z";
  return path;
}

// Generate plant positions from plan data
function generatePlantPositionsFromPlan(
  plants: Plant[],
  sections: Section[],
  lengthM: number,
  widthM: number,
  svgWidth: number,
  svgHeight: number
): PlantPosition[] {
  const positions: PlantPosition[] = [];
  const rowConfig = {
    BACK: { yMin: 0.05, yMax: 0.38 },
    MIDDLE: { yMin: 0.4, yMax: 0.68 },
    FRONT: { yMin: 0.7, yMax: 0.92 },
  };

  // Group plants by row
  const byRow: Record<string, Plant[]> = { BACK: [], MIDDLE: [], FRONT: [] };
  plants.forEach((p) => {
    if (p.row in byRow) byRow[p.row].push(p);
  });

  Object.entries(byRow).forEach(([row, rowPlants]) => {
    const { yMin, yMax } = rowConfig[row as keyof typeof rowConfig];
    const totalSpacing = rowPlants.reduce((sum, p) => sum + (p.spacingCm ?? 50), 0);
    const plantsPerRow = Math.max(1, Math.floor((lengthM * 100) / (totalSpacing / rowPlants.length || 50)));

    let xPos = 0.03;
    rowPlants.forEach((plant, plantIdx) => {
      const spacingFrac = (plant.spacingCm ?? 50) / (lengthM * 100);
      const plantsToPlace = Math.max(1, Math.round(plantsPerRow / rowPlants.length));

      for (let i = 0; i < plantsToPlace && xPos < 0.97; i++) {
        const yVariation = Math.random() * (yMax - yMin) + yMin;
        const xVariation = xPos + (Math.random() - 0.5) * spacingFrac * 0.3;

        positions.push({
          id: `pos-${row}-${plantIdx}-${i}`,
          plantName: plant.commonName,
          plantColor: plant.color ?? "#4A8A32",
          plantEmoji: plant.iconEmoji ?? "🌿",
          x: Math.max(0.02, Math.min(0.98, xVariation)) * 100,
          y: Math.max(0.02, Math.min(0.98, yVariation)) * 100,
          sectionId: sections.find((s) => s.row === row)?.id ?? row,
          row: row as "BACK" | "MIDDLE" | "FRONT",
        });

        xPos += spacingFrac;
      }
    });
  });

  return positions;
}

export function GardenSchema({ plan, isPremium = false, className }: GardenSchemaProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const SVG_W = 700;
  const SVG_H = 240;
  const PADDING = 20;

  const sections = (plan.sections ?? []) as Section[];
  const plantListData = plan.plantList as { plants?: Plant[] } | null;
  const plants = (plantListData?.plants ?? []) as Plant[];
  const existingPositions = (plan.plantPositions ?? []) as PlantPosition[];

  const plantPositions = existingPositions.length > 0
    ? existingPositions
    : generatePlantPositionsFromPlan(plants, sections, plan.lengthMeters, plan.widthMeters ?? 2, SVG_W - 2 * PADDING, SVG_H - 2 * PADDING);

  const curvePoints = (plan.shapeData ?? []) as CurvePoint[];

  // Build a plant lookup map
  const plantMap = new Map<string, Plant>();
  plants.forEach((p) => plantMap.set(p.commonName, p));

  // Get unique plant names for legend
  const uniquePlants = Array.from(
    new Map(plantPositions.map((p) => [p.plantName, p])).values()
  );

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.5, Math.min(3, z * delta)));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setLastPanPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastPanPos.x;
    const dy = e.clientY - lastPanPos.y;
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    setLastPanPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleExportPNG = async () => {
    if (!svgRef.current || !isPremium) return;
    setIsExporting(true);
    try {
      const svgEl = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const canvas = document.createElement("canvas");
      canvas.width = SVG_W * 2;
      canvas.height = (SVG_H + 60) * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = "#FAF6EF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const link = document.createElement("a");
        link.download = `${plan.name ?? "garden-plan"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        setIsExporting(false);
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch {
      setIsExporting(false);
    }
  };

  const filteredPositions = activeSection
    ? plantPositions.filter((p) => p.sectionId === activeSection || p.row === activeSection)
    : plantPositions;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-garden-earth-light flex-shrink-0">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setZoom((z) => Math.min(3, z * 1.2))}
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setZoom((z) => Math.max(0.5, z * 0.8))}
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground font-mono ml-1">{Math.round(zoom * 100)}%</span>
        </div>

        <div className="flex items-center gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border font-body transition-colors",
                activeSection === section.id
                  ? "bg-garden-green text-white border-garden-green"
                  : "border-garden-earth-light text-garden-forest hover:border-garden-earth"
              )}
            >
              {section.label}
            </button>
          ))}
          {isPremium && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleExportPNG}
              disabled={isExporting}
              title="Export as PNG"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-amber-50/30 cursor-grab active:cursor-grabbing relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_W} ${SVG_H + 60}`}
            className="w-full max-w-[700px] select-none"
            style={{ maxHeight: "280px" }}
          >
            {/* Definitions */}
            <defs>
              <filter id="plant-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.2" />
              </filter>
              <pattern id="soil-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.8" fill="#C8A96E" opacity="0.25" />
                <circle cx="6" cy="6" r="0.6" fill="#A08040" opacity="0.2" />
              </pattern>
            </defs>

            {/* Background soil */}
            <rect
              x={PADDING}
              y={PADDING}
              width={SVG_W - 2 * PADDING}
              height={SVG_H - 2 * PADDING}
              fill="url(#soil-pattern)"
              rx="8"
            />

            {/* Garden border outline */}
            {plan.shapeType === "ORGANIC" && curvePoints.length > 0 ? (
              <path
                d={generateOrganicPath(
                  plan.lengthMeters,
                  plan.widthMeters ?? 2,
                  curvePoints,
                  SVG_W - 2 * PADDING,
                  SVG_H - 2 * PADDING
                )}
                fill="none"
                stroke="#C8A96E"
                strokeWidth="2"
                transform={`translate(${PADDING}, ${PADDING})`}
              />
            ) : (
              <rect
                x={PADDING}
                y={PADDING}
                width={SVG_W - 2 * PADDING}
                height={SVG_H - 2 * PADDING}
                fill="none"
                stroke="#C8A96E"
                strokeWidth="2"
                strokeDasharray={plan.shapeType === "ORGANIC" ? "6,3" : "0"}
                rx="8"
              />
            )}

            {/* Row dividers */}
            <line
              x1={PADDING}
              y1={PADDING + (SVG_H - 2 * PADDING) * 0.4}
              x2={SVG_W - PADDING}
              y2={PADDING + (SVG_H - 2 * PADDING) * 0.4}
              stroke="#C8A96E"
              strokeWidth="0.8"
              strokeDasharray="4,4"
              opacity="0.5"
            />
            <line
              x1={PADDING}
              y1={PADDING + (SVG_H - 2 * PADDING) * 0.7}
              x2={SVG_W - PADDING}
              y2={PADDING + (SVG_H - 2 * PADDING) * 0.7}
              stroke="#C8A96E"
              strokeWidth="0.8"
              strokeDasharray="4,4"
              opacity="0.5"
            />

            {/* Row labels */}
            {[
              { label: "BACK", y: PADDING + 8 },
              { label: "MIDDLE", y: PADDING + (SVG_H - 2 * PADDING) * 0.44 },
              { label: "FRONT", y: PADDING + (SVG_H - 2 * PADDING) * 0.74 },
            ].map(({ label, y }) => (
              <text
                key={label}
                x={PADDING + 6}
                y={y + 10}
                fontSize="7"
                fill="#A08040"
                fontFamily="monospace"
                opacity="0.7"
              >
                {label}
              </text>
            ))}

            {/* Plant positions */}
            {filteredPositions.map((pos) => {
              const x = PADDING + (pos.x / 100) * (SVG_W - 2 * PADDING);
              const y = PADDING + (pos.y / 100) * (SVG_H - 2 * PADDING);
              const radius = pos.row === "BACK" ? 12 : pos.row === "MIDDLE" ? 10 : 8;
              const plant = plantMap.get(pos.plantName);
              const isHovered = tooltip?.position.id === pos.id;

              return (
                <g
                  key={pos.id}
                  filter="url(#plant-shadow)"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      plant: plant ?? null,
                      position: pos,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onMouseMove={(e) => {
                    if (tooltip) {
                      setTooltip((t) => t ? { ...t, x: e.clientX, y: e.clientY } : null);
                    }
                  }}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? radius + 2 : radius}
                    fill={pos.plantColor}
                    fillOpacity={0.85}
                    stroke="white"
                    strokeWidth={isHovered ? 2 : 1.5}
                    style={{ transition: "r 0.1s, stroke-width 0.1s" }}
                  />
                  <text
                    x={x}
                    y={y + (radius * 0.4)}
                    textAnchor="middle"
                    fontSize={radius * 0.9}
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {pos.plantEmoji}
                  </text>
                </g>
              );
            })}

            {/* Dimension labels */}
            <text x={SVG_W / 2} y={SVG_H - 4} textAnchor="middle" fontSize="9" fill="#A08040" fontFamily="monospace">
              {plan.lengthMeters}m
            </text>
            <text
              x={8}
              y={SVG_H / 2}
              textAnchor="middle"
              fontSize="9"
              fill="#A08040"
              fontFamily="monospace"
              transform={`rotate(-90, 8, ${SVG_H / 2})`}
            >
              {plan.widthMeters ?? 2}m
            </text>

            {/* Legend */}
            <g transform={`translate(${PADDING}, ${SVG_H + 5})`}>
              {uniquePlants.slice(0, 12).map((pos, idx) => {
                const lx = (idx % 6) * 112;
                const ly = Math.floor(idx / 6) * 18;
                return (
                  <g key={pos.plantName} transform={`translate(${lx}, ${ly})`}>
                    <circle cx="6" cy="6" r="5" fill={pos.plantColor} fillOpacity="0.85" stroke="white" strokeWidth="1" />
                    <text x="14" y="9.5" fontSize="8" fill="#555" fontFamily="sans-serif">
                      {pos.plantName.length > 11 ? pos.plantName.slice(0, 11) + "…" : pos.plantName}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="garden-tooltip"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 40,
            }}
          >
            <div className="font-semibold">
              {tooltip.position.plantEmoji} {tooltip.position.plantName}
            </div>
            {tooltip.plant && (
              <>
                {tooltip.plant.latinName && (
                  <div className="italic text-garden-cream/70">{tooltip.plant.latinName}</div>
                )}
                <div className="mt-1 text-xs opacity-80">
                  {tooltip.position.row} row · H: {tooltip.plant.heightMinCm}–{tooltip.plant.heightMaxCm}cm
                </div>
                {tooltip.plant.bloomMonths?.length > 0 && (
                  <div className="text-xs opacity-80">
                    Blooms: {tooltip.plant.bloomMonths.map((m) => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1]).join(", ")}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
