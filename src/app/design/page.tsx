"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Leaf, MessageCircle, Map } from "lucide-react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { GardenCanvas } from "@/components/garden/GardenCanvas";
import { Navbar } from "@/components/layout/Navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { GardenPlan } from "@/types";

export default function DesignPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [plan, setPlan] = useState<GardenPlan | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "preview">("chat");

  const planId = searchParams.get("planId");

  // Load plan if planId in URL
  useEffect(() => {
    if (planId) {
      fetch(`/api/plans/${planId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.plan) {
            setPlan(data.plan);
            if (data.plan.chatSession?.id) {
              setSessionId(data.plan.chatSession.id);
            }
          }
        })
        .catch(console.error);
    }
  }, [planId]);

  const handlePlanUpdate = (updatedPlan: Partial<GardenPlan>) => {
    if (updatedPlan.id) {
      fetch(`/api/plans/${updatedPlan.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.plan) {
            setPlan(data.plan);
            // Auto-switch to preview when plan is ready
            if (data.plan.status === "COMPLETE") {
              setActiveTab("preview");
            }
          }
        })
        .catch(console.error);
    } else {
      setPlan((prev) => prev ? { ...prev, ...updatedPlan } : null);
    }
  };

  const isPremium = session?.user
    ? ["PRO_MONTHLY", "PRO_YEARLY", "ONE_TIME"].includes((session.user as { tier?: string }).tier ?? "")
    : false;

  return (
    <div className="flex flex-col min-h-screen bg-garden-cream">
      <Navbar />

      {/* Desktop layout */}
      <div className="hidden md:flex flex-1 pt-16 h-screen">
        {/* Chat panel - 60% */}
        <div className="w-[60%] flex flex-col p-4 gap-0 border-r border-garden-earth-light">
          <div className="flex-1 min-h-0">
            <ChatInterface
              sessionId={sessionId}
              planId={plan?.id}
              onPlanUpdate={handlePlanUpdate}
              className="h-full"
            />
          </div>
        </div>

        {/* Garden preview - 40% */}
        <div className="w-[40%] flex flex-col p-4">
          <GardenCanvas
            plan={plan}
            isPremium={isPremium}
            className="flex-1 min-h-0"
          />
        </div>
      </div>

      {/* Mobile layout - tabs */}
      <div className="md:hidden flex flex-col flex-1 pt-16">
        <div className="bg-white border-b border-garden-earth-light px-4 py-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "preview")}>
            <TabsList className="w-full">
              <TabsTrigger value="chat" className="flex-1 gap-1.5">
                <MessageCircle className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1 gap-1.5">
                <Map className="w-4 h-4" />
                Preview
                {plan?.status === "COMPLETE" && (
                  <span className="w-2 h-2 bg-garden-green rounded-full" />
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" ? (
            <ChatInterface
              sessionId={sessionId}
              planId={plan?.id}
              onPlanUpdate={handlePlanUpdate}
              className="h-full rounded-none border-none"
            />
          ) : (
            <GardenCanvas
              plan={plan}
              isPremium={isPremium}
              className="h-full rounded-none border-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
