"use client";

import { useState, useCallback, useMemo } from "react";
import type { GardenPlan, PlanData, Plant, Section, PlantPosition } from "@/types";

interface UseGardenPlanOptions {
  initialPlan?: GardenPlan | null;
}

export function useGardenPlan({ initialPlan }: UseGardenPlanOptions = {}) {
  const [plan, setPlan] = useState<GardenPlan | null>(initialPlan ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planData = useMemo<PlanData | null>(() => {
    if (!plan?.plantList) return null;
    return plan.plantList as unknown as PlanData;
  }, [plan]);

  const sections = useMemo<Section[]>(() => {
    return (planData?.sections ?? plan?.sections ?? []) as Section[];
  }, [planData, plan]);

  const plants = useMemo<Plant[]>(() => {
    return (planData?.plants ?? []) as Plant[];
  }, [planData]);

  const plantPositions = useMemo<PlantPosition[]>(() => {
    return (planData?.plantPositions ?? plan?.plantPositions ?? []) as PlantPosition[];
  }, [planData, plan]);

  const isPremium = false; // Managed by session/store

  const fetchPlan = useCallback(async (planId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/plans/${planId}`);
      if (!res.ok) throw new Error("Failed to fetch plan");
      const data = await res.json();
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePlan = useCallback(async (planId: string, updates: Partial<GardenPlan>) => {
    try {
      const res = await fetch(`/api/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update plan");
      const data = await res.json();
      setPlan(data.plan);
      return data.plan;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update plan");
      throw err;
    }
  }, []);

  const createPlan = useCallback(async (planData: Partial<GardenPlan>) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planData),
      });
      if (!res.ok) throw new Error("Failed to create plan");
      const data = await res.json();
      setPlan(data.plan);
      return data.plan;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create plan");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    plan,
    setPlan,
    planData,
    sections,
    plants,
    plantPositions,
    isPremium,
    isLoading,
    error,
    fetchPlan,
    updatePlan,
    createPlan,
  };
}
