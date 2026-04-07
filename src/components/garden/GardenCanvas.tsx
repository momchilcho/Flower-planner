"use client";

import React, { useState } from "react";
import { Sprout } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GardenSchema } from "./GardenSchema";
import { BloomCalendar } from "./BloomCalendar";
import { ShoppingList } from "./ShoppingList";
import { PlantGuide } from "./PlantGuide";
import { PaywallOverlay } from "./PaywallOverlay";
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
      {/* Animated garden outline placeholder */}
      <div className="relative w-64 h-40">
        <svg viewBox="0 0 260 160" className="w-full h-full opacity-30">
          <rect x="10" y="10" width="240" height="140" rx="12" fill="none" stroke="#C8A96E" strokeWidth="2" strokeDasharray="8,4" />
          {/* Row dividers */}
          <line x1="10" y1="60" x2="250" y2="60" stroke="#C8A96E" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
          <line x1="10" y1="110" x2="250" y2="110" stroke="#C8A96E" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
          {/* Placeholder plant dots */}
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

  const premiumTabs = ["bloom", "plants", "shopping"];
  const isTabLocked = (tab: string) => !isPremium && premiumTabs.includes(tab);

  return (
    <div className={cn("flex flex-col h-full bg-white rounded-2xl border border-garden-earth-light overflow-hidden", className)}>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col h-full"
      >
        <div className="px-4 py-2 border-b border-garden-earth-light flex-shrink-0">
          <TabsList className="w-full h-9">
            <TabsTrigger value="schema" className="flex-1 text-xs">
              🗺️ Schema
            </TabsTrigger>
            <TabsTrigger value="bloom" className="flex-1 text-xs">
              📅 Bloom {!isPremium && "🔒"}
            </TabsTrigger>
            <TabsTrigger value="plants" className="flex-1 text-xs">
              🌿 Plants {!isPremium && "🔒"}
            </TabsTrigger>
            <TabsTrigger value="shopping" className="flex-1 text-xs">
              🛒 Shop {!isPremium && "🔒"}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <TabsContent value="schema" className="h-full m-0">
            <div className="h-full relative">
              <GardenSchema plan={plan} isPremium={isPremium} />
              {!isPremium && (
                <PaywallOverlay planId={plan.id} feature="schema" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="bloom" className="h-full m-0">
            <div className="h-full relative">
              <BloomCalendar plants={plants} isPremium={isPremium} />
              {isTabLocked("bloom") && (
                <PaywallOverlay planId={plan.id} feature="bloom calendar" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="plants" className="h-full m-0">
            <div className="h-full relative">
              <PlantGuide plants={plants} isPremium={isPremium} />
              {isTabLocked("plants") && (
                <PaywallOverlay planId={plan.id} feature="plant guide" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="shopping" className="h-full m-0">
            <div className="h-full relative">
              <ShoppingList items={shoppingList} isPremium={isPremium} />
              {isTabLocked("shopping") && (
                <PaywallOverlay planId={plan.id} feature="shopping list" />
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
