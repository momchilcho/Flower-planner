"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2, MessageCircle, Map } from "lucide-react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { GardenCanvas } from "@/components/garden/GardenCanvas";
import { Navbar } from "@/components/layout/Navbar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GardenPlan } from "@/types";

function DesignContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [plan, setPlan] = useState<GardenPlan | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "preview">("chat");

  const planId = searchParams.get("planId");

  useEffect(() => {
    if (planId) {
      fetch(`/api/plans/${planId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.plan) {
            setPlan(data.plan);
            if (data.plan.chatSession?.id) setSessionId(data.plan.chatSession.id);
          }
        })
        .catch(console.error);
    }
  }, [planId]);

  const handlePlanUpdate = (updatedPlan: Partial<GardenPlan>) => {
    if (!updatedPlan?.id) {
      if (updatedPlan) {
        setPlan((prev) => prev ? { ...prev, ...updatedPlan } : null);
      }
      return;
    }
    fetch(`/api/plans/${updatedPlan.id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Plan fetch failed: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data.plan) {
          setPlan(data.plan);
          setActiveTab("preview");
        }
      })
      .catch((err) => {
        console.error("[design] Failed to load plan:", err);
      });
  };

  const isPremium = session?.user
    ? ["PRO_MONTHLY", "PRO_YEARLY", "ONE_TIME"].includes((session.user as { tier?: string }).tier ?? "")
    : false;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-garden-cream">
      <Navbar />

      {/* Desktop layout */}
      <div className="hidden md:flex flex-1 min-h-0 pt-16">
        <div className="w-1/2 flex flex-col p-4 border-r border-garden-earth-light overflow-hidden">
          <div className="flex-1 min-h-0">
            <ChatInterface sessionId={sessionId} planId={plan?.id} onPlanUpdate={handlePlanUpdate} className="h-full" />
          </div>
        </div>
        <div className="w-1/2 flex flex-col p-4 overflow-hidden">
          <GardenCanvas plan={plan} isPremium={isPremium} className="flex-1 min-h-0" />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex flex-col flex-1 min-h-0 pt-16">
        <div className="bg-white border-b border-garden-earth-light px-4 py-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "preview")}>
            <TabsList className="w-full">
              <TabsTrigger value="chat" className="flex-1 gap-1.5">
                <MessageCircle className="w-4 h-4" />Chat
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1 gap-1.5">
                <Map className="w-4 h-4" />Preview
                {plan?.status === "COMPLETE" && <span className="w-2 h-2 bg-garden-green rounded-full" />}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === "chat" ? (
            <ChatInterface sessionId={sessionId} planId={plan?.id} onPlanUpdate={handlePlanUpdate} className="h-full rounded-none border-none" />
          ) : (
            <GardenCanvas plan={plan} isPremium={isPremium} className="h-full rounded-none border-none" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function DesignPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-garden-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-garden-green" />
      </div>
    }>
      <DesignContent />
    </Suspense>
  );
}
