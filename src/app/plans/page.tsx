import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Leaf, Clock, CheckCircle, FileEdit, Archive } from "lucide-react";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { formatDate } from "@/lib/utils";

async function getPlans(userId: string) {
  return prisma.gardenPlan.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      lengthMeters: true,
      widthMeters: true,
      shapeType: true,
      country: true,
      sunExposure: true,
      soilType: true,
      createdAt: true,
      updatedAt: true,
      chatSession: { select: { id: true } },
    },
  });
}

const statusConfig = {
  DRAFT: { label: "Draft", variant: "draft" as const, icon: FileEdit },
  GENERATING: { label: "Generating…", variant: "generating" as const, icon: Clock },
  COMPLETE: { label: "Complete", variant: "complete" as const, icon: CheckCircle },
  ARCHIVED: { label: "Archived", variant: "archived" as const, icon: Archive },
};

const sunLabels = {
  FULL_SUN: "☀️ Full Sun",
  PARTIAL_SHADE: "⛅ Partial Shade",
  FULL_SHADE: "🌑 Full Shade",
};

const soilLabels = {
  CLAY: "Clay",
  SANDY: "Sandy",
  LOAM: "Loam",
  CHALKY: "Chalky",
  PEATY: "Peaty",
};

export default async function PlansPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/plans");
  }

  const userId = (session.user as { id: string }).id;
  const plans = await getPlans(userId);

  return (
    <div className="min-h-screen bg-garden-cream">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-garden-forest">My Garden Plans</h1>
            <p className="text-muted-foreground font-body mt-1">
              {plans.length} {plans.length === 1 ? "plan" : "plans"} saved
            </p>
          </div>
          <Link href="/design">
            <Button variant="garden" className="gap-2">
              <Plus className="w-4 h-4" />
              New Plan
            </Button>
          </Link>
        </div>

        {/* Plans grid */}
        {plans.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-garden-earth-light">
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="font-display text-2xl font-semibold text-garden-forest mb-3">
              No garden plans yet
            </h2>
            <p className="text-muted-foreground font-body mb-8 max-w-sm mx-auto">
              Start chatting with our AI designer to create your first personalized garden plan.
            </p>
            <Link href="/design">
              <Button variant="garden" size="lg">
                <Leaf className="w-5 h-5 mr-2" />
                Design My First Garden
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const statusInfo = statusConfig[plan.status];
              const StatusIcon = statusInfo.icon;

              return (
                <Link key={plan.id} href={`/design?planId=${plan.id}`}>
                  <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border-garden-earth-light">
                    {/* Visual thumbnail */}
                    <div className="h-36 bg-gradient-to-br from-garden-green/10 to-garden-earth/10 rounded-t-xl border-b border-garden-earth-light relative overflow-hidden">
                      <svg viewBox="0 0 300 140" className="w-full h-full opacity-60">
                        <rect x="10" y="10" width="280" height="120" rx="8" fill="none" stroke="#C8A96E" strokeWidth="1.5" />
                        <line x1="10" y1="52" x2="290" y2="52" stroke="#C8A96E" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.5" />
                        <line x1="10" y1="92" x2="290" y2="92" stroke="#C8A96E" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.5" />
                        {/* Sample plant dots */}
                        {plan.status === "COMPLETE" ? (
                          <>
                            {[35, 80, 125, 170, 215, 258].map((x) => (
                              <circle key={x} cx={x} cy={33} r={9} fill="#4A8A32" opacity="0.7" />
                            ))}
                            {[55, 110, 165, 220].map((x) => (
                              <circle key={x} cx={x} cy={73} r={7} fill="#E88AAD" opacity="0.7" />
                            ))}
                            {[80, 150, 220].map((x) => (
                              <circle key={x} cx={x} cy={110} r={5} fill="#C8A96E" opacity="0.7" />
                            ))}
                          </>
                        ) : (
                          <>
                            {[60, 120, 180, 240].map((x) => (
                              <circle key={x} cx={x} cy={43} r={8} fill="#C8A96E" opacity="0.3" />
                            ))}
                          </>
                        )}
                      </svg>

                      <div className="absolute top-3 right-3">
                        <Badge variant={statusInfo.variant} className="gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-display font-semibold text-garden-forest text-base mb-1 group-hover:text-garden-green transition-colors">
                        {plan.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body mb-3">
                        <span>{plan.lengthMeters}m × {plan.widthMeters ?? 2}m</span>
                        <span>·</span>
                        <span>{sunLabels[plan.sunExposure]}</span>
                        <span>·</span>
                        <span>{soilLabels[plan.soilType]}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-body">
                        Updated {formatDate(plan.updatedAt)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}

            {/* New plan card */}
            <Link href="/design">
              <div className="group flex flex-col items-center justify-center h-full min-h-[200px] rounded-xl border-2 border-dashed border-garden-earth-light hover:border-garden-green hover:bg-garden-green/5 transition-all cursor-pointer p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-garden-cream-dark group-hover:bg-garden-green/10 flex items-center justify-center mb-3 transition-colors">
                  <Plus className="w-6 h-6 text-garden-earth group-hover:text-garden-green transition-colors" />
                </div>
                <p className="text-sm font-semibold text-garden-earth group-hover:text-garden-green font-body transition-colors">
                  New Garden Plan
                </p>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  Start a conversation with AI
                </p>
              </div>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
