"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageCircle, Map, ArrowLeft, Pencil, Check } from "lucide-react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { GardenCanvas } from "@/components/garden/GardenCanvas";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GardenPlan } from "@/types";

interface PlanPageProps {
  params: { planId: string };
}

export default function PlanDetailPage({ params }: PlanPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plan, setPlan] = useState<GardenPlan | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "preview">("preview");
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");

  const isPremium =
    session?.user &&
    ["PRO_MONTHLY", "PRO_YEARLY", "ONE_TIME"].includes(
      (session.user as { tier?: string }).tier ?? ""
    );

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=/design/${params.planId}`);
    }
  }, [status, router, params.planId]);

  // Load plan
  useEffect(() => {
    if (status !== "authenticated") return;

    fetch(`/api/plans/${params.planId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.plan) {
          setPlan(data.plan);
          setNameValue(data.plan.name);
          if (data.plan.chatSession?.id) {
            setSessionId(data.plan.chatSession.id);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.planId, status]);

  const handlePlanUpdate = (updatedPlan: Partial<GardenPlan>) => {
    if (updatedPlan.id) {
      fetch(`/api/plans/${updatedPlan.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.plan) {
            setPlan(data.plan);
            if (data.plan.status === "COMPLETE") {
              setActiveTab("preview");
            }
          }
        })
        .catch(console.error);
    } else {
      setPlan((prev) => (prev ? { ...prev, ...updatedPlan } : null));
    }
  };

  const saveName = async () => {
    if (!plan || !nameValue.trim()) return;
    setEditingName(false);
    await fetch(`/api/plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameValue.trim() }),
    });
    setPlan((prev) => (prev ? { ...prev, name: nameValue.trim() } : prev));
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-garden-cream">
        <Navbar />
        <div className="flex flex-1 items-center justify-center pt-16">
          <div className="text-center space-y-4">
            <div className="text-5xl animate-pulse">🌿</div>
            <p className="font-body text-muted-foreground">Loading your garden plan…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col min-h-screen bg-garden-cream">
        <Navbar />
        <div className="flex flex-1 items-center justify-center pt-16">
          <div className="text-center space-y-4">
            <div className="text-5xl">🌱</div>
            <h2 className="font-display text-xl font-semibold text-garden-forest">
              Plan not found
            </h2>
            <p className="font-body text-muted-foreground text-sm">
              This garden plan doesn&apos;t exist or you don&apos;t have access to it.
            </p>
            <Button variant="garden" onClick={() => router.push("/plans")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              My Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-garden-cream">
      <Navbar />

      {/* Sub-header with plan name */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white/95 border-b border-garden-earth-light backdrop-blur-sm px-4 py-2 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/plans")}
          className="gap-1.5 text-muted-foreground hover:text-garden-green"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Plans</span>
        </Button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") setEditingName(false);
                }}
                className="h-7 text-sm font-display font-semibold max-w-xs"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={saveName} className="h-7 w-7 p-0">
                <Check className="w-3.5 h-3.5 text-garden-green" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1.5 group min-w-0"
            >
              <span className="font-display text-sm font-semibold text-garden-forest truncate">
                {plan.name}
              </span>
              <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop layout — two panels */}
      <div className="hidden md:flex flex-1 pt-28 h-screen">
        <div className="w-[60%] flex flex-col p-4 border-r border-garden-earth-light">
          <ChatInterface
            sessionId={sessionId}
            planId={plan.id}
            onPlanUpdate={handlePlanUpdate}
            className="h-full"
          />
        </div>
        <div className="w-[40%] flex flex-col p-4">
          <GardenCanvas
            plan={plan}
            isPremium={!!isPremium}
            className="flex-1 min-h-0"
          />
        </div>
      </div>

      {/* Mobile layout — tabs */}
      <div className="md:hidden flex flex-col flex-1 pt-28">
        <div className="bg-white border-b border-garden-earth-light px-4 py-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "preview")}>
            <TabsList className="w-full">
              <TabsTrigger value="preview" className="flex-1 gap-1.5">
                <Map className="w-4 h-4" />
                Preview
                {plan.status === "COMPLETE" && (
                  <span className="w-2 h-2 bg-garden-green rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex-1 gap-1.5">
                <MessageCircle className="w-4 h-4" />
                Chat
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" ? (
            <ChatInterface
              sessionId={sessionId}
              planId={plan.id}
              onPlanUpdate={handlePlanUpdate}
              className="h-full rounded-none border-none"
            />
          ) : (
            <GardenCanvas
              plan={plan}
              isPremium={!!isPremium}
              className="h-full rounded-none border-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
