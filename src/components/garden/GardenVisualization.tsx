"use client";

import React, { useState } from "react";
import { Wand2, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GardenVisualizationProps {
  planId: string;
  className?: string;
}

export function GardenVisualization({ planId, className }: GardenVisualizationProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/garden/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full gap-5 p-8 text-center bg-garden-cream/30", className)}>
        <div className="w-20 h-20 rounded-full border-4 border-garden-green/20 flex items-center justify-center">
          <Loader2 className="w-9 h-9 text-garden-green animate-spin" />
        </div>
        <div>
          <p className="font-semibold text-garden-forest font-body text-base">Creating your garden…</p>
          <p className="text-sm text-muted-foreground font-body mt-1">Takes about 15–20 seconds</p>
        </div>
        <div className="flex gap-1.5">
          {["🌱", "🌿", "🌸", "🌺", "🌻"].map((emoji, i) => (
            <span
              key={i}
              className="text-xl animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="AI-generated garden visualization"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 bg-white border-t border-garden-earth-light flex-shrink-0">
          <p className="text-xs text-muted-foreground font-body italic">
            AI visualisation · Artistic impression, not exact
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={generate}
            className="gap-1.5 h-7 text-xs text-garden-green hover:text-garden-green"
          >
            <RefreshCw className="w-3 h-3" />
            Regenerate
          </Button>
        </div>
      </div>
    );
  }

  // Idle state
  return (
    <div className={cn("flex flex-col items-center justify-center h-full gap-6 p-8 text-center", className)}>
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-garden-green/20 to-garden-sage/20 flex items-center justify-center">
          <Wand2 className="w-10 h-10 text-garden-green" />
        </div>
        <span className="absolute -top-1 -right-1 text-2xl">✨</span>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold text-garden-forest mb-2">
          AI Garden Visualisation
        </h3>
        <p className="text-sm text-muted-foreground font-body max-w-xs leading-relaxed">
          See a photorealistic preview of your garden in full bloom — generated from your exact plant list and layout.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 max-w-xs font-body">
          {error}
        </p>
      )}

      <Button variant="garden" size="lg" onClick={generate} className="gap-2 px-6">
        <Wand2 className="w-4 h-4" />
        Generate Realistic Preview
      </Button>

      <p className="text-xs text-muted-foreground font-body">
        Powered by FLUX AI · ~15 seconds
      </p>
    </div>
  );
}
