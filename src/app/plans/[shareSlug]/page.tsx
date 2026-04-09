import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Leaf, Calendar, ShoppingCart, Map, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GardenSchema } from "@/components/garden/GardenSchema";
import { BloomCalendar } from "@/components/garden/BloomCalendar";
import { ShoppingList } from "@/components/garden/ShoppingList";
import { PlantGuide } from "@/components/garden/PlantGuide";
import { formatDate } from "@/lib/utils";
import type { GardenPlan, PlanData } from "@/types";

interface SharedPlanPageProps {
  params: { shareSlug: string };
}

async function getPlan(shareSlug: string) {
  return prisma.gardenPlan.findFirst({
    where: { shareSlug, isPublic: true, status: "COMPLETE" },
    include: {
      user: { select: { name: true, tier: true } },
    },
  });
}

export async function generateMetadata({ params }: SharedPlanPageProps) {
  const plan = await getPlan(params.shareSlug);
  if (!plan) return { title: "Plan not found — GardenGenius" };
  return {
    title: `${plan.name} — Shared Garden Plan | GardenGenius`,
    description: `Explore this beautiful garden plan designed with GardenGenius AI. ${plan.lengthMeters}m × ${plan.widthMeters ?? 2}m ${plan.sunExposure.replace("_", " ").toLowerCase()} border.`,
  };
}

export default async function SharedPlanPage({ params }: SharedPlanPageProps) {
  const plan = await getPlan(params.shareSlug);

  if (!plan) notFound();

  const planData = plan.plantList as PlanData | null;
  const creatorFirstName = plan.user.name?.split(" ")[0] ?? "Someone";
  const isPremium = ["PRO_MONTHLY", "PRO_YEARLY", "ONE_TIME"].includes(plan.user.tier ?? "");

  // Cast for component use
  const planForComponents = plan as unknown as GardenPlan;

  return (
    <div className="min-h-screen bg-garden-cream">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-garden-green/10 text-garden-green text-sm font-body px-4 py-1.5 rounded-full mb-4">
            <Leaf className="w-4 h-4" />
            Shared Garden Plan
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-garden-forest mb-3">
            {plan.name}
          </h1>
          <p className="text-muted-foreground font-body text-sm">
            Designed by <span className="font-medium text-garden-forest">{creatorFirstName}</span>
            {" · "}
            {plan.lengthMeters}m × {plan.widthMeters ?? 2}m
            {" · "}
            {plan.sunExposure.replace("_", " ").toLowerCase()}
            {" · "}
            {formatDate(plan.createdAt)}
          </p>
        </div>

        {/* Stats */}
        {planData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Plant Species", value: planData.plants?.length ?? 0, emoji: "🌿" },
              { label: "Total Plants", value: planData.shoppingList?.reduce((s, i) => s + i.quantity, 0) ?? 0, emoji: "🌱" },
              { label: "Bloom Months", value: "Mar – Nov", emoji: "🌸" },
              { label: "Est. Cost", value: `€${planData.shoppingList?.reduce((s, i) => s + i.totalPrice, 0).toFixed(0) ?? 0}`, emoji: "💶" },
            ].map(({ label, value, emoji }) => (
              <div key={label} className="bg-white rounded-xl p-4 text-center border border-garden-earth-light">
                <div className="text-2xl mb-1">{emoji}</div>
                <div className="font-display text-xl font-bold text-garden-forest">{value}</div>
                <div className="text-xs text-muted-foreground font-body">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Garden Schema */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Map className="w-5 h-5 text-garden-green" />
            <h2 className="font-display text-xl font-semibold text-garden-forest">Planting Map</h2>
          </div>
          <div className="bg-white rounded-2xl border border-garden-earth-light overflow-hidden p-4">
            <GardenSchema plan={planForComponents} isPremium={isPremium} hideTooltipDetails={!isPremium} />
          </div>
        </section>

        {/* Bloom Calendar */}
        {planData?.plants && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-garden-green" />
              <h2 className="font-display text-xl font-semibold text-garden-forest">Bloom Calendar</h2>
            </div>
            <div className="bg-white rounded-2xl border border-garden-earth-light overflow-hidden p-4" style={{ minHeight: "200px" }}>
              <BloomCalendar plants={planData.plants} isPremium={isPremium} />
            </div>
          </section>
        )}

        {/* Plant Guide */}
        {planData?.plants && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-garden-green" />
              <h2 className="font-display text-xl font-semibold text-garden-forest">Plant Guide</h2>
            </div>
            <div className="bg-white rounded-2xl border border-garden-earth-light overflow-hidden p-4" style={{ minHeight: "200px" }}>
              <PlantGuide plants={planData.plants} isPremium={isPremium} />
            </div>
          </section>
        )}

        {/* Shopping List */}
        {planData?.shoppingList && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-garden-green" />
              <h2 className="font-display text-xl font-semibold text-garden-forest">Shopping List</h2>
            </div>
            <div className="bg-white rounded-2xl border border-garden-earth-light overflow-hidden" style={{ minHeight: "200px" }}>
              <ShoppingList items={planData.shoppingList} isPremium={isPremium} />
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center bg-gradient-to-br from-garden-green to-garden-green-dark rounded-2xl p-10 text-white">
          <div className="text-4xl mb-4">🌿</div>
          <h2 className="font-display text-2xl font-bold mb-3">
            Design Your Own Garden
          </h2>
          <p className="font-body text-white/80 mb-6 max-w-md mx-auto">
            Create a personalized planting plan for your space in minutes — powered by AI.
          </p>
          <Link href="/design">
            <Button size="lg" className="bg-white text-garden-green hover:bg-garden-cream font-semibold">
              <Leaf className="w-4 h-4 mr-2" />
              Start Designing for Free
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
