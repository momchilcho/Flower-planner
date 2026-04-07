import React from "react";
import Link from "next/link";
import { CheckCircle, X, Leaf, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "€0",
    period: "forever",
    description: "Get started with AI garden design",
    cta: "Start Free",
    ctaHref: "/design",
    variant: "outline" as const,
    highlight: false,
    features: [
      { text: "1 garden plan", included: true },
      { text: "AI chat (10 messages)", included: true },
      { text: "Basic plant suggestions", included: true },
      { text: "Garden overview preview", included: true },
      { text: "Visual garden schema", included: false },
      { text: "Full bloom calendar", included: false },
      { text: "Shopping list with prices", included: false },
      { text: "PDF export", included: false },
      { text: "Sketch upload & analysis", included: false },
      { text: "Unlimited plans", included: false },
    ],
  },
  {
    id: "monthly",
    name: "Pro Monthly",
    price: "€9.99",
    period: "/ month",
    description: "For serious garden enthusiasts",
    cta: "Start Pro Monthly",
    ctaHref: "/api/stripe/checkout",
    priceType: "monthly" as const,
    variant: "garden" as const,
    highlight: true,
    badge: "Most Popular",
    features: [
      { text: "Unlimited garden plans", included: true },
      { text: "Unlimited AI chat", included: true },
      { text: "Full visual garden schema", included: true },
      { text: "Interactive bloom calendar", included: true },
      { text: "Shopping list with prices", included: true },
      { text: "PDF export", included: true },
      { text: "Sketch upload & analysis", included: true },
      { text: "Plant care guides", included: true },
      { text: "Priority support", included: true },
      { text: "Cancel anytime", included: true },
    ],
  },
  {
    id: "yearly",
    name: "Pro Annual",
    price: "€49.99",
    period: "/ year",
    subPrice: "€4.17 / month",
    savings: "Save 58%",
    description: "Best value for garden planning",
    cta: "Start Pro Annual",
    ctaHref: "/api/stripe/checkout",
    priceType: "yearly" as const,
    variant: "garden" as const,
    highlight: false,
    features: [
      { text: "Everything in Monthly", included: true },
      { text: "2 months free", included: true },
      { text: "Earliest access to new features", included: true },
      { text: "Annual garden redesign session", included: true },
      { text: "Export multiple formats", included: true },
      { text: "Sharing & collaboration", included: true },
      { text: "Dedicated email support", included: true },
      { text: "Plant database contributions", included: true },
      { text: "Seasonal planting reminders", included: true },
      { text: "No price changes guarantee", included: true },
    ],
  },
  {
    id: "onetime",
    name: "One Garden",
    price: "€29.99",
    period: "one-time",
    description: "Perfect for a single garden project",
    cta: "Buy Now",
    ctaHref: "/api/stripe/checkout",
    priceType: "onetime" as const,
    variant: "outline" as const,
    highlight: false,
    features: [
      { text: "1 complete garden plan", included: true },
      { text: "Full visual schema", included: true },
      { text: "Bloom calendar", included: true },
      { text: "Shopping list", included: true },
      { text: "PDF export", included: true },
      { text: "Sketch upload", included: true },
      { text: "Unlimited chat for that plan", included: true },
      { text: "Unlimited revisions", included: true },
      { text: "Lifetime access to that plan", included: true },
      { text: "No subscription required", included: true },
    ],
  },
];

const faqs = [
  {
    q: "Can I cancel my subscription at any time?",
    a: "Yes! You can cancel your monthly or annual subscription at any time from your account settings. You'll continue to have access until the end of your billing period.",
  },
  {
    q: "Do I need a credit card to start the free plan?",
    a: "No credit card required for the free plan. Just sign up with your email or Google account and start designing immediately.",
  },
  {
    q: "What's included in the visual garden schema?",
    a: "The visual schema is an interactive SVG showing your garden layout with colored plant dots positioned by row (back, middle, front). You can zoom, pan, and hover over each plant for details. Pro users can export it as a PNG.",
  },
  {
    q: "How does the one-time plan work?",
    a: "The one-time €29.99 plan gives you complete access to design one garden plan — including schema, bloom calendar, shopping list, and PDF export. You own that plan forever with no recurring charges.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact us at support@gardengenius.app and we'll refund you promptly.",
  },
];

const comparisonFeatures = [
  { feature: "Garden plans", free: "1", monthly: "Unlimited", yearly: "Unlimited", onetime: "1" },
  { feature: "AI chat messages", free: "10/session", monthly: "Unlimited", yearly: "Unlimited", onetime: "Unlimited" },
  { feature: "Visual garden schema", free: "❌", monthly: "✅", yearly: "✅", onetime: "✅" },
  { feature: "Bloom calendar", free: "3 months", monthly: "Full 12 months", yearly: "Full 12 months", onetime: "Full 12 months" },
  { feature: "Shopping list", free: "❌", monthly: "✅", yearly: "✅", onetime: "✅" },
  { feature: "PDF export", free: "❌", monthly: "✅", yearly: "✅", onetime: "✅" },
  { feature: "Sketch upload", free: "❌", monthly: "✅", yearly: "✅", onetime: "✅" },
  { feature: "Plant care guides", free: "3 plants", monthly: "All plants", yearly: "All plants", onetime: "All plants" },
  { feature: "Priority support", free: "❌", monthly: "✅", yearly: "✅", onetime: "❌" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-garden-cream">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="text-center px-4 mb-16">
          <span className="text-garden-green font-semibold text-sm font-body uppercase tracking-wider">Pricing</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-garden-forest mt-2 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground font-body max-w-xl mx-auto">
            Start free. Upgrade when you&apos;re ready for your complete garden plan.
          </p>
        </section>

        {/* Pricing cards */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative overflow-visible flex flex-col border-garden-earth-light ${
                  plan.highlight ? "border-garden-green ring-2 ring-garden-green/20 shadow-lg" : ""
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <span className="bg-garden-green text-white text-xs font-semibold font-body px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}
                {plan.savings && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <span className="bg-garden-earth text-white text-xs font-semibold font-body px-3 py-1 rounded-full">
                      {plan.savings}
                    </span>
                  </div>
                )}

                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="mb-5">
                    <h2 className="font-display text-lg font-bold text-garden-forest">{plan.name}</h2>
                    <p className="text-xs text-muted-foreground font-body mb-3">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-3xl font-bold text-garden-forest">{plan.price}</span>
                      <span className="text-sm text-muted-foreground font-body">{plan.period}</span>
                    </div>
                    {plan.subPrice && (
                      <p className="text-xs text-garden-green font-body mt-0.5">{plan.subPrice}</p>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-center gap-2 text-xs font-body">
                        {f.included
                          ? <CheckCircle className="w-3.5 h-3.5 text-garden-green flex-shrink-0" />
                          : <X className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                        }
                        <span className={f.included ? "text-garden-forest" : "text-muted-foreground"}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.ctaHref}>
                    <Button variant={plan.variant} className="w-full" size="default">
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Feature comparison table */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
          <h2 className="font-display text-2xl font-bold text-garden-forest text-center mb-8">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto bg-white rounded-2xl border border-garden-earth-light shadow-sm">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-garden-earth-light">
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Feature</th>
                  <th className="text-center px-4 py-4 text-muted-foreground font-medium">Free</th>
                  <th className="text-center px-4 py-4 text-garden-green font-semibold">Monthly</th>
                  <th className="text-center px-4 py-4 text-garden-earth-dark font-semibold">Annual</th>
                  <th className="text-center px-4 py-4 text-muted-foreground font-medium">One-time</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, idx) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-garden-earth-light/50 ${idx % 2 === 0 ? "bg-white" : "bg-garden-cream/20"}`}
                  >
                    <td className="px-6 py-3 text-garden-forest font-medium">{row.feature}</td>
                    <td className="text-center px-4 py-3 text-muted-foreground text-xs">{row.free}</td>
                    <td className="text-center px-4 py-3 text-garden-green text-xs font-medium">{row.monthly}</td>
                    <td className="text-center px-4 py-3 text-garden-earth-dark text-xs font-medium">{row.yearly}</td>
                    <td className="text-center px-4 py-3 text-muted-foreground text-xs">{row.onetime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Trust signals */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "30-Day Guarantee", desc: "Not happy? Get a full refund within 30 days, no questions asked." },
              { icon: Zap, title: "Instant Access", desc: "Start designing your garden immediately after payment — no waiting." },
              { icon: Leaf, title: "Cancel Anytime", desc: "No lock-in. Cancel your subscription instantly from your dashboard." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center bg-white rounded-xl border border-garden-earth-light p-6">
                <div className="w-10 h-10 bg-garden-green/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-garden-green" />
                </div>
                <h3 className="font-display font-semibold text-garden-forest mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground font-body">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16">
          <h2 className="font-display text-2xl font-bold text-garden-forest text-center mb-8">
            Pricing FAQ
          </h2>
          <Accordion type="single" collapsible className="bg-white rounded-2xl px-6 border border-garden-earth-light">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA */}
        <section className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-garden-forest mb-4">
            Ready to grow your dream garden?
          </h2>
          <p className="text-muted-foreground font-body mb-8">
            Start for free today. No credit card needed.
          </p>
          <Link href="/design">
            <Button variant="garden" size="xl">
              <Leaf className="w-5 h-5" />
              Start Designing Free
            </Button>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
