import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GardenPlan, ChatMessage, Tier } from "@/types";

interface GardenStore {
  // Current plan
  currentPlan: GardenPlan | null;
  setCurrentPlan: (plan: GardenPlan | null) => void;
  updateCurrentPlan: (updates: Partial<GardenPlan>) => void;

  // Chat messages (local cache)
  chatMessages: Record<string, ChatMessage[]>;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  setMessages: (sessionId: string, messages: ChatMessage[]) => void;
  clearMessages: (sessionId: string) => void;

  // User tier
  userTier: Tier;
  setTier: (tier: Tier) => void;
  isPremium: () => boolean;

  // Active session
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;

  // UI state
  activeTab: "schema" | "bloom" | "plants" | "shopping";
  setActiveTab: (tab: "schema" | "bloom" | "plants" | "shopping") => void;

  // Loading states
  isGeneratingPlan: boolean;
  setIsGeneratingPlan: (v: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  currentPlan: null,
  chatMessages: {},
  userTier: "FREE" as Tier,
  activeSessionId: null,
  activeTab: "schema" as const,
  isGeneratingPlan: false,
};

export const useGardenStore = create<GardenStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentPlan: (plan) => set({ currentPlan: plan }),

      updateCurrentPlan: (updates) =>
        set((state) => ({
          currentPlan: state.currentPlan
            ? { ...state.currentPlan, ...updates }
            : null,
        })),

      addMessage: (sessionId, message) =>
        set((state) => ({
          chatMessages: {
            ...state.chatMessages,
            [sessionId]: [
              ...(state.chatMessages[sessionId] ?? []),
              message,
            ],
          },
        })),

      setMessages: (sessionId, messages) =>
        set((state) => ({
          chatMessages: {
            ...state.chatMessages,
            [sessionId]: messages,
          },
        })),

      clearMessages: (sessionId) =>
        set((state) => {
          const { [sessionId]: _, ...rest } = state.chatMessages;
          return { chatMessages: rest };
        }),

      setTier: (tier) => set({ userTier: tier }),

      isPremium: () => {
        const tier = get().userTier;
        return tier === "PRO_MONTHLY" || tier === "PRO_YEARLY" || tier === "ONE_TIME";
      },

      setActiveSessionId: (id) => set({ activeSessionId: id }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      setIsGeneratingPlan: (v) => set({ isGeneratingPlan: v }),

      reset: () => set(initialState),
    }),
    {
      name: "garden-genius-store",
      partialize: (state) => ({
        userTier: state.userTier,
        activeSessionId: state.activeSessionId,
      }),
    }
  )
);
