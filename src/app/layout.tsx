import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "GardenGenius – AI-Powered Garden Design",
    template: "%s | GardenGenius",
  },
  description:
    "Design your dream garden with AI. Get a personalized planting plan, bloom calendar, and shopping list in minutes.",
  keywords: [
    "garden design",
    "AI garden planner",
    "perennial garden",
    "planting plan",
    "bloom calendar",
    "garden AI",
  ],
  authors: [{ name: "GardenGenius" }],
  creator: "GardenGenius",
  openGraph: {
    type: "website",
    locale: "en_EU",
    url: "https://gardengenius.app",
    title: "GardenGenius – AI-Powered Garden Design",
    description: "Design your dream garden with AI in minutes.",
    siteName: "GardenGenius",
  },
  twitter: {
    card: "summary_large_image",
    title: "GardenGenius – AI-Powered Garden Design",
    description: "Design your dream garden with AI in minutes.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body antialiased" style={{ backgroundColor: "#FAF6EF" }}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
