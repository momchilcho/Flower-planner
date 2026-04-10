"use client";

import React, { useState } from "react";
import { Sprout, Lock, Loader2, CheckCircle, Share2, Copy, Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GardenSchema } from "./GardenSchema";
import { BloomCalendar } from "./BloomCalendar";
import { ShoppingList } from "./ShoppingList";
import { PlantGuide } from "./PlantGuide";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GardenPlan, PlanData } from "@/types";

interface GardenCanvasProps {
  plan: GardenPlan | null;
  isPremium?: boolean;
  className?: string;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-6">
      <div className="relative w-64 h-40">
        <svg viewBox="0 0 260 160" className="w-full h-full opacity-30">
          <rect x="10" y="10" width="240" height="140" rx="12" fill="none" stroke="#C8A96E" strokeWidth="2" strokeDasharray="8,4" />
          <line x1="10" y1="60" x2="250" y2="60" stroke="#C8A96E" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
          <line x1="10" y1="110" x2="250" y2="110" stroke="#C8A96E" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
          {[30, 70, 110, 150, 190, 230].map((x) => (
            <circle key={x} cx={x} cy={38} r={10} fill="#C8A96E" opacity="0.3" />
          ))}
          {[50, 100, 150, 200].map((x) => (
            <circle key={x} cx={x} cy={83} r={8} fill="#C8A96E" opacity="0.25" />
          ))}
          {[70, 130, 190].map((x) => (
            <circle key={x} cx={x} cy={125} r={6} fill="#C8A96E" opacity="0.2" />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sprout className="w-10 h-10 text-garden-green/40 animate-pulse" />
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold text-garden-forest mb-2">
          Your Garden Preview
        </h3>
        <p className="text-sm text-muted-foreground font-body max-w-xs leading-relaxed">
          Chat with the AI designer to describe your garden. Your visual planting plan will appear here as the design takes shape.
        </p>
      </div>

      <div className="flex flex-col gap-2 text-xs font-body text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-garden-earth-light" />
          <span>Visual garden schema</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-garden-earth-light" />
          <span>Month-by-month bloom calendar</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-garden-earth-light" />
          <span>Complete shopping list</span>
        </div>
      </div>
    </div>
  );
}

function SneakPeekBanner({ planId }: { planId: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  const checkout = async (priceType: "monthly" | "yearly" | "onetime") => {
    setLoading(priceType);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceType, planId }),
      });
      const { url, error } = await res.json();
      if (url) window.location.href = url;
      else throw new Error(error ?? "Checkout failed");
    } catch {
      setLoading(null);
    }
  };

  const perks = [
    "Full plan with 15+ placed plants",
    "12-month bloom calendar",
    "Shopping list with quantities & prices",
    "PDF export",
  ];

  return (
    <div className="flex-shrink-0 bg-white border-t-2 border-garden-green/30 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-garden-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Lock className="w-4 h-4 text-garden-green" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-garden-forest font-body">
            Your garden is designed! Unlock the full plan
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 mb-2.5">
            {perks.map((p) => (
              <span key={p} className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                <CheckCircle className="w-3 h-3 text-garden-green flex-shrink-0" />
                {p}
              </span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            <Button size="sm" variant="garden" className="h-8 text-xs px-3" onClick={() => checkout("onetime")} disabled={!!loading}>
              {loading === "onetime" ? <Loader2 className="w-3 h-3 animate-spin" /> : "€29.99 one-time"}
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs px-3 border-garden-green text-garden-green hover:bg-garden-green/5" onClick={() => checkout("monthly")} disabled={!!loading}>
              {loading === "monthly" ? <Loader2 className="w-3 h-3 animate-spin" /> : "€9.99 / month"}
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs px-3 text-muted-foreground" onClick={() => checkout("yearly")} disabled={!!loading}>
              {loading === "yearly" ? <Loader2 className="w-3 h-3 animate-spin" /> : "€49.99 / year"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareButton({ plan }: { plan: GardenPlan }) {
  const [state, setState] = useState<"idle" | "loading" | "copied" | "error">("idle");
  const [shareUrl, setShareUrl] = useState<string | null>(plan.isPublic && plan.shareSlug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/plans/${plan.shareSlug}`
    : null
  );

  const handleShare = async () => {
    if (state === "loading") return;

    // If already public and URL known, just copy
    if (shareUrl) {
      await copyToClipboard(shareUrl);
      return;
    }

    setState("loading");
    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: true }),
      });
      if (!res.ok) throw new Error("Failed to generate share link");
      const data = await res.json();
      const slug = data.plan?.shareSlug;
      if (!slug) throw new Error("No share slug returned");
      const url = `${window.location.origin}/plans/${slug}`;
      setShareUrl(url);
      await copyToClipboard(url);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={state === "loading"}
      className={cn(
        "h-8 gap-1.5 text-xs font-body border-garden-earth-light transition-colors",
        state === "copied" && "border-garden-green text-garden-green bg-garden-green/5",
        state === "error" && "border-red-300 text-red-500"
      )}
    >
      {state === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {state === "copied" && <Check className="w-3.5 h-3.5" />}
      {state === "error" && <Share2 className="w-3.5 h-3.5" />}
      {state === "idle" && (shareUrl ? <Copy className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />)}
      {state === "loading" ? "Generating…" : state === "copied" ? "Link copied!" : state === "error" ? "Try again" : "Share"}
    </Button>
  );
}

export function GardenCanvas({ plan, isPremium = false, className }: GardenCanvasProps) {
  const [activeTab, setActiveTab] = useState("schema");

  const planData = plan?.plantList as PlanData | null;
  const plants = planData?.plants ?? [];
  const shoppingList = planData?.shoppingList ?? [];
  const hasPlan = plan && plan.status !== "DRAFT" && plants.length > 0;

  if (!hasPlan) {
    return (
      <div className={cn("flex flex-col h-full bg-white rounded-2xl border border-garden-earth-light overflow-hidden", className)}>
        <div className="px-4 py-3 border-b border-garden-earth-light">
          <h2 className="font-display text-base font-semibold text-garden-forest">Garden Preview</h2>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-white rounded-2xl border border-garden-earth-light overflow-hidden", className)}>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col h-full"
      >
        <div className="px-3 py-2 border-b border-garden-earth-light flex-shrink-0 flex items-center gap-2">
          <TabsList className="flex-1 h-9">
            <TabsTrigger value="schema" className="flex-1 text-xs">
              🗺️ Map
            </TabsTrigger>
            <TabsTrigger value="bloom" className="flex-1 text-xs">
              📅 Bloom
            </TabsTrigger>
            <TabsTrigger value="plants" className="flex-1 text-xs">
              🌿 Plants
            </TabsTrigger>
            <TabsTrigger value="shopping" className="flex-1 text-xs">
              🛒 Shop
            </TabsTrigger>
          </TabsList>
          <ShareButton plan={plan} />
        </div>

        <div className="flex-1 overflow-hidden relative min-h-0">
          <TabsContent value="schema" className="h-full m-0">
            {isPremium ? (
              <GardenSchema plan={plan} isPremium={true} className="h-full" />
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1 min-h-0 relative">
                  <GardenSchema plan={plan} isPremium={false} className="h-full" />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
                </div>
                <SneakPeekBanner planId={plan.id} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="bloom" className="h-full m-0">
            <BloomCalendar plants={plants} isPremium={isPremium} />
          </TabsContent>

          <TabsContent value="plants" className="h-full m-0">
            <PlantGuide plants={plants} isPremium={isPremium} />
          </TabsContent>

          <TabsContent value="shopping" className="h-full m-0">
            <ShoppingList items={shoppingList} isPremium={isPremium} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
