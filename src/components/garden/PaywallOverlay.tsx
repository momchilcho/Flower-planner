"use client";

import React, { useState } from "react";
import { Lock, CheckCircle, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PaywallOverlayProps {
  planId?: string | null;
  feature?: string;
}

const pricingOptions = [
  {
    id: "onetime" as const,
    label: "One-Time",
    price: "€29.99",
    description: "Single garden plan",
    popular: false,
  },
  {
    id: "monthly" as const,
    label: "Monthly",
    price: "€9.99",
    period: "/mo",
    description: "Cancel anytime",
    popular: true,
  },
  {
    id: "yearly" as const,
    label: "Annual",
    price: "€49.99",
    period: "/yr",
    description: "Best value — save 58%",
    popular: false,
  },
];

const benefits = [
  "Full visual garden schema with all 15+ plants",
  "Interactive planting map with hover details",
  "12-month bloom calendar",
  "Complete shopping list with prices",
  "PDF export for printing",
  "Unlimited garden plan revisions",
];

export function PaywallOverlay({ planId }: PaywallOverlayProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCheckout = async (priceType: "monthly" | "yearly" | "onetime") => {
    setIsLoading(priceType);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceType, planId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create checkout session");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 rounded-2xl overflow-hidden">
      {/* Blurred background */}
      <div className="absolute inset-0 backdrop-blur-[3px] bg-white/20" />

      <div className="relative z-10 max-w-md w-full mx-4 bg-white rounded-2xl shadow-2xl border border-garden-earth-light overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-garden-green to-garden-green-light px-6 py-5 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold text-white mb-1">
            Your Garden Plan is Ready!
          </h2>
          <p className="text-garden-cream/80 text-sm font-body">
            Unlock your complete personalized garden design
          </p>
        </div>

        <div className="p-6">
          {/* Benefits */}
          <ul className="space-y-2 mb-6">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm font-body text-garden-forest">
                <CheckCircle className="w-4 h-4 text-garden-green flex-shrink-0 mt-0.5" />
                {benefit}
              </li>
            ))}
          </ul>

          {/* Pricing options */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {pricingOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleCheckout(option.id)}
                disabled={!!isLoading}
                className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all text-left ${
                  option.popular
                    ? "border-garden-green bg-garden-green/5 shadow-sm"
                    : "border-garden-earth-light hover:border-garden-earth"
                } disabled:opacity-60`}
              >
                {option.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-garden-green text-white text-[10px] font-semibold px-2 py-0.5 rounded-full font-body whitespace-nowrap">
                    Popular
                  </span>
                )}
                <span className="text-xs text-muted-foreground font-body mb-1">{option.label}</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="font-display font-bold text-garden-forest text-base">{option.price}</span>
                  {option.period && (
                    <span className="text-xs text-muted-foreground font-body">{option.period}</span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground font-body mt-0.5 text-center leading-tight">
                  {option.description}
                </span>
                {isLoading === option.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl">
                    <Loader2 className="w-4 h-4 animate-spin text-garden-green" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Guarantee */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-body bg-garden-cream rounded-xl px-4 py-2.5">
            <Shield className="w-4 h-4 text-garden-green flex-shrink-0" />
            <span>30-day money-back guarantee · Secure payment via Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
