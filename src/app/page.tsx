import React from "react";
import Link from "next/link";
import { Leaf, MessageCircle, Camera, FileText, Calendar, ShoppingCart, Download, Star, CheckCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const features = [
  {
    icon: MessageCircle,
    title: "AI Chat Designer",
    description: "Describe your garden vision in plain language. Our AI asks the right questions and designs your perfect garden.",
    color: "text-garden-green",
    bg: "bg-garden-green/10",
  },
  {
    icon: Camera,
    title: "Sketch Upload",
    description: "Upload a hand-drawn sketch or photo of your space. The AI analyzes it and turns it into a professional planting plan.",
    color: "text-garden-pink-dark",
    bg: "bg-garden-pink/10",
  },
  {
    icon: FileText,
    title: "Visual Garden Schema",
    description: "Get an interactive SVG map of your garden with precise plant placements, colored by species.",
    color: "text-garden-earth-dark",
    bg: "bg-garden-earth/10",
  },
  {
    icon: Calendar,
    title: "Bloom Calendar",
    description: "See exactly when each plant blooms throughout the year. Plan for continuous color from spring to autumn.",
    color: "text-garden-green",
    bg: "bg-garden-green/10",
  },
  {
    icon: ShoppingCart,
    title: "Shopping List",
    description: "A complete shopping list with quantities and estimated prices. Print and take to the garden center.",
    color: "text-garden-pink-dark",
    bg: "bg-garden-pink/10",
  },
  {
    icon: Download,
    title: "PDF Export",
    description: "Download your complete garden plan as a beautiful PDF to share with your landscaper or keep for reference.",
    color: "text-garden-earth-dark",
    bg: "bg-garden-earth/10",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Describe Your Space",
    description: "Tell the AI about your garden dimensions, sun exposure, soil type, and style preferences through a natural conversation.",
    emoji: "💬",
  },
  {
    step: "02",
    title: "AI Designs Your Garden",
    description: "Our AI selects the perfect European perennials for your conditions, creating a balanced design with year-round interest.",
    emoji: "🌿",
  },
  {
    step: "03",
    title: "Plant & Enjoy",
    description: "Download your planting plan, bloom calendar, and shopping list. Follow the guide and watch your garden come to life.",
    emoji: "🌸",
  },
];

const testimonials = [
  {
    name: "Sophie Vandenberghe",
    location: "Ghent, Belgium",
    avatar: "SV",
    rating: 5,
    text: "I had no idea where to start with my new garden. GardenGenius asked me a few questions and within minutes I had a complete plan with 18 perennials perfectly suited to my clay soil. My garden looks amazing!",
  },
  {
    name: "Martin Weber",
    location: "Munich, Germany",
    avatar: "MW",
    rating: 5,
    text: "The bloom calendar feature is incredible. I can see exactly when each plant flowers and my garden now has color from March through November. The shopping list saved me hours at the garden center.",
  },
  {
    name: "Emma Richardson",
    location: "Bristol, UK",
    avatar: "ER",
    rating: 5,
    text: "I uploaded a sketch of my awkward L-shaped border and the AI figured out the perfect layout. The visual schema shows exactly where each plant goes. Worth every penny!",
  },
];

const faqs = [
  {
    question: "Do I need any garden design experience?",
    answer: "Not at all! GardenGenius is designed for complete beginners. You just describe your garden in plain language – the AI handles all the design expertise. It asks helpful questions to understand your space and preferences.",
  },
  {
    question: "What plants does the AI use?",
    answer: "We focus on European perennials proven to thrive in climates from Belgium to Germany, the UK, and beyond. All plants are carefully chosen for hardiness, beauty, and bee-friendliness. Every plan includes a mix of spring, summer, and autumn bloomers.",
  },
  {
    question: "Can I upload a photo of my garden?",
    answer: "Yes! You can upload a hand-drawn sketch, a photo of your garden space, or even an existing plan. The AI analyzes the image and uses it as the basis for your new garden design.",
  },
  {
    question: "How accurate are the plant quantities and prices?",
    answer: "Plant quantities are calculated based on your garden dimensions and the recommended spacing for each species. Prices are estimates based on typical Belgian/European garden center prices and may vary by region and season.",
  },
  {
    question: "Can I edit the plan after it's generated?",
    answer: "With a Pro plan, you can continue chatting with the AI to refine your plan – swap plants, adjust the layout, or try a different style. The AI will update your plan and all the associated documents.",
  },
];

const pricingFeatures = {
  free: [
    "1 garden plan",
    "AI chat design (10 messages)",
    "Basic plant suggestions",
    "Garden overview",
  ],
  pro: [
    "Unlimited garden plans",
    "Unlimited AI chat",
    "Full visual garden schema",
    "Interactive bloom calendar",
    "Complete shopping list with prices",
    "PDF export",
    "Sketch upload & analysis",
    "Priority support",
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-garden-cream">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-garden-forest via-garden-green-dark to-garden-green" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(200,169,110,0.2)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(232,138,173,0.15)_0%,_transparent_60%)]" />

        {/* Decorative garden SVG */}
        <div className="absolute bottom-0 left-0 right-0 h-64 opacity-20 pointer-events-none">
          <svg viewBox="0 0 1440 256" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,200 Q180,120 360,180 Q540,240 720,160 Q900,80 1080,160 Q1260,240 1440,180 L1440,256 L0,256 Z" fill="#4A8A32" />
            <path d="M0,220 Q200,160 400,200 Q600,240 800,180 Q1000,120 1200,200 Q1320,230 1440,200 L1440,256 L0,256 Z" fill="#2D5F1E" />
          </svg>
        </div>

        {/* Floating plant decorations */}
        <div className="absolute top-20 left-10 text-5xl opacity-20 animate-leaf-sway">🌿</div>
        <div className="absolute top-32 right-20 text-4xl opacity-20 animate-leaf-sway animation-delay-200">🌸</div>
        <div className="absolute bottom-40 left-20 text-3xl opacity-20 animate-leaf-sway animation-delay-500">🌺</div>
        <div className="absolute bottom-32 right-10 text-4xl opacity-20 animate-leaf-sway animation-delay-300">🌼</div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <span className="text-lg">🌱</span>
            <span className="text-garden-cream/90 text-sm font-body font-medium">AI-Powered Garden Design</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-garden-cream mb-6 leading-tight">
            Your Dream Garden,
            <br />
            <span className="text-garden-earth-light">Designed by AI</span>
          </h1>

          <p className="text-garden-cream/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-body leading-relaxed">
            Describe your space, upload a sketch, or start a conversation. 
            Get a complete planting plan with bloom calendar, shopping list, and visual schema — in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/design">
              <Button variant="garden" size="xl" className="shadow-xl shadow-black/20 min-w-[200px]">
                <MessageCircle className="w-5 h-5" />
                Chat with Designer
              </Button>
            </Link>
            <Link href="/design">
              <Button
                size="xl"
                className="bg-white/15 backdrop-blur-sm text-garden-cream border border-white/30 hover:bg-white/25 min-w-[200px]"
              >
                <Camera className="w-5 h-5" />
                Upload a Sketch
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-garden-cream/50 text-sm font-body">
            Free to start · No credit card required · 50+ European perennials
          </p>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-garden-cream/40" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-garden-green font-semibold text-sm font-body uppercase tracking-wider">Simple Process</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-garden-forest mt-2 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto font-body">
              From idea to garden plan in three easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, idx) => (
              <div
                key={item.step}
                className="relative text-center group"
              >
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[calc(50%+4rem)] right-0 h-px bg-gradient-to-r from-garden-earth-light to-transparent" />
                )}
                <div className="text-6xl mb-4 group-hover:animate-bloom-in">{item.emoji}</div>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-garden-green/10 text-garden-green font-bold font-mono text-sm mb-4">
                  {item.step}
                </div>
                <h3 className="font-display text-xl font-semibold text-garden-forest mb-3">{item.title}</h3>
                <p className="text-muted-foreground font-body leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-garden-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-garden-green font-semibold text-sm font-body uppercase tracking-wider">Features</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-garden-forest mt-2 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto font-body">
              Professional garden design tools powered by AI
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-garden-earth-light/50">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-garden-forest mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Plan Preview */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-garden-green font-semibold text-sm font-body uppercase tracking-wider">Live Preview</span>
            <h2 className="font-display text-4xl font-bold text-garden-forest mt-2 mb-4">
              See a Sample Garden Plan
            </h2>
            <p className="text-muted-foreground font-body">
              A 6m × 2m sunny border with clay soil — generated in 2 minutes
            </p>
          </div>

          {/* Static SVG Garden Schema Demo */}
          <div className="bg-garden-cream rounded-2xl border border-garden-earth-light p-6 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-garden-forest">Cottage Garden Border</h3>
                <p className="text-sm text-muted-foreground font-body">6m × 2m · Full Sun · Loam soil</p>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1 text-xs bg-garden-green/10 text-garden-green px-2 py-1 rounded-full font-body">
                  <span>18 plants</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-garden-pink/10 text-garden-pink-dark px-2 py-1 rounded-full font-body">
                  <span>5 months bloom</span>
                </span>
              </div>
            </div>

            <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-200">
              <svg viewBox="0 0 600 200" className="w-full" style={{ maxHeight: "280px" }}>
                {/* Garden border */}
                <rect x="10" y="10" width="580" height="180" rx="12" fill="#F5EDD8" stroke="#C8A96E" strokeWidth="2" />
                
                {/* Back row label */}
                <text x="20" y="45" fontSize="8" fill="#A08040" fontFamily="monospace">BACK ROW</text>
                {/* Back row plants */}
                {[
                  { cx: 60, label: "Delphinium", color: "#6B8DD6", emoji: "💙" },
                  { cx: 130, label: "Verbascum", color: "#DFC49A", emoji: "🌼" },
                  { cx: 200, label: "Echinacea", color: "#E88AAD", emoji: "🌸" },
                  { cx: 270, label: "Salvia N.", color: "#7B68EE", emoji: "💜" },
                  { cx: 340, label: "Kniphofia", color: "#FF6B35", emoji: "🔥" },
                  { cx: 410, label: "Phlox", color: "#F2B0C8", emoji: "🩷" },
                  { cx: 480, label: "Aster", color: "#9B59B6", emoji: "💜" },
                  { cx: 540, label: "Rudbeckia", color: "#F4D03F", emoji: "🌻" },
                ].map((p) => (
                  <g key={p.cx}>
                    <circle cx={p.cx} cy={55} r={18} fill={p.color} fillOpacity="0.85" stroke="white" strokeWidth="1.5" />
                    <text x={p.cx} y={59} textAnchor="middle" fontSize="10">{p.emoji}</text>
                    <text x={p.cx} y={84} textAnchor="middle" fontSize="6" fill="#555">{p.label}</text>
                  </g>
                ))}

                {/* Middle row label */}
                <text x="20" y="115" fontSize="8" fill="#A08040" fontFamily="monospace">MIDDLE</text>
                {/* Middle row plants */}
                {[
                  { cx: 80, label: "Lavender", color: "#9B59B6", emoji: "💜" },
                  { cx: 160, label: "Geranium", color: "#8E44AD", emoji: "🌸" },
                  { cx: 240, label: "Hemeroc.", color: "#E67E22", emoji: "🟠" },
                  { cx: 320, label: "Perovskia", color: "#5DADE2", emoji: "🔵" },
                  { cx: 400, label: "Achillea", color: "#F7DC6F", emoji: "🌼" },
                  { cx: 480, label: "Monarda", color: "#E74C3C", emoji: "❤️" },
                ].map((p) => (
                  <g key={p.cx}>
                    <circle cx={p.cx} cy={120} r={14} fill={p.color} fillOpacity="0.85" stroke="white" strokeWidth="1.5" />
                    <text x={p.cx} y={124} textAnchor="middle" fontSize="9">{p.emoji}</text>
                    <text x={p.cx} y={145} textAnchor="middle" fontSize="6" fill="#555">{p.label}</text>
                  </g>
                ))}

                {/* Front row label */}
                <text x="20" y="168" fontSize="8" fill="#A08040" fontFamily="monospace">FRONT</text>
                {/* Front row plants */}
                {[
                  { cx: 100, label: "Alchemilla", color: "#52BE80", emoji: "💚" },
                  { cx: 200, label: "Nepeta", color: "#85C1E9", emoji: "🔵" },
                  { cx: 300, label: "Stachys", color: "#BDC3C7", emoji: "⚪" },
                  { cx: 400, label: "Sedum", color: "#E8DAEF", emoji: "🌸" },
                  { cx: 500, label: "Armeria", color: "#FF69B4", emoji: "🩷" },
                ].map((p) => (
                  <g key={p.cx}>
                    <circle cx={p.cx} cy={170} r={10} fill={p.color} fillOpacity="0.85" stroke="white" strokeWidth="1.5" />
                    <text x={p.cx} y={174} textAnchor="middle" fontSize="7">{p.emoji}</text>
                  </g>
                ))}

                {/* Scale bar */}
                <line x1="480" y1="190" x2="580" y2="190" stroke="#A08040" strokeWidth="1" />
                <line x1="480" y1="187" x2="480" y2="193" stroke="#A08040" strokeWidth="1" />
                <line x1="580" y1="187" x2="580" y2="193" stroke="#A08040" strokeWidth="1" />
                <text x="530" y="200" textAnchor="middle" fontSize="7" fill="#A08040">1 m</text>
              </svg>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {["💜 Salvia", "🌸 Echinacea", "💚 Alchemilla", "💜 Lavender", "🌼 Achillea", "🩷 Phlox"].map((plant) => (
                <span key={plant} className="text-xs bg-white border border-garden-earth-light rounded-full px-3 py-1 font-body text-garden-forest">
                  {plant}
                </span>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/design">
              <Button variant="garden" size="lg">
                Create Your Garden Plan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-garden-cream">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-garden-green font-semibold text-sm font-body uppercase tracking-wider">Pricing</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-garden-forest mt-2 mb-4">
              Simple, Honest Pricing
            </h2>
            <p className="text-muted-foreground font-body">
              Start free. Upgrade when you're ready to see your full garden plan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free */}
            <Card className="border-garden-earth-light">
              <CardContent className="p-8">
                <div className="mb-6">
                  <span className="text-sm font-body text-muted-foreground uppercase tracking-wider">Free</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="font-display text-4xl font-bold text-garden-forest">€0</span>
                    <span className="text-muted-foreground font-body">/ forever</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {pricingFeatures.free.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm font-body text-garden-forest">
                      <CheckCircle className="w-4 h-4 text-garden-green flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/design">
                  <Button variant="outline" className="w-full">Get Started Free</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="border-garden-green bg-garden-green relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-garden-earth text-white text-xs font-semibold font-body px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <CardContent className="p-8">
                <div className="mb-6">
                  <span className="text-sm font-body text-garden-cream/70 uppercase tracking-wider">Pro</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="font-display text-4xl font-bold text-garden-cream">€9.99</span>
                    <span className="text-garden-cream/70 font-body">/ month</span>
                  </div>
                  <p className="text-xs text-garden-cream/60 font-body mt-1">or €49.99/year · or €29.99 one-time</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {pricingFeatures.pro.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm font-body text-garden-cream">
                      <CheckCircle className="w-4 h-4 text-garden-earth-light flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing">
                  <Button className="w-full bg-white text-garden-green hover:bg-garden-cream font-semibold">
                    View Pricing Plans
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-garden-green font-semibold text-sm font-body uppercase tracking-wider">Testimonials</span>
            <h2 className="font-display text-4xl font-bold text-garden-forest mt-2 mb-4">
              Gardens People Love
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-garden-earth-light hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-garden-earth text-garden-earth" />
                    ))}
                  </div>
                  <p className="text-sm text-garden-forest font-body leading-relaxed mb-6 italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-garden-green flex items-center justify-center text-garden-cream font-semibold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-garden-forest font-body">{t.name}</p>
                      <p className="text-xs text-muted-foreground font-body">{t.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-garden-cream">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-garden-green font-semibold text-sm font-body uppercase tracking-wider">FAQ</span>
            <h2 className="font-display text-4xl font-bold text-garden-forest mt-2 mb-4">
              Common Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="bg-white rounded-2xl px-6 border border-garden-earth-light">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger className="text-left text-garden-forest font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-garden-green relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(200,169,110,0.15)_0%,_transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-6">🌺</div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-garden-cream mb-6">
            Ready to Design Your Dream Garden?
          </h2>
          <p className="text-garden-cream/80 text-lg mb-10 font-body leading-relaxed">
            Join thousands of garden lovers who have transformed their outdoor spaces 
            with AI-powered design. Start for free today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/design">
              <Button className="bg-white text-garden-green hover:bg-garden-cream font-semibold" size="xl">
                <Leaf className="w-5 h-5" />
                Start Designing Now
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="xl"
                className="bg-transparent text-garden-cream border border-garden-cream/30 hover:bg-white/10"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
