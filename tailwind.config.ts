import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // GardenGenius brand palette
        garden: {
          green: "#2D5F1E",
          "green-light": "#4A8A32",
          "green-dark": "#1A3A10",
          earth: "#C8A96E",
          "earth-light": "#DFC49A",
          "earth-dark": "#A08040",
          pink: "#E88AAD",
          "pink-light": "#F2B0C8",
          "pink-dark": "#D06090",
          cream: "#FAF6EF",
          "cream-dark": "#F0E8D8",
          forest: "#1A1F16",
          brown: "#2A2820",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "garden-texture": "url('/textures/paper-grain.svg')",
        "soil-pattern": "url('/textures/soil-dots.svg')",
      },
      animation: {
        "bloom-in": "bloomIn 0.6s ease-out forwards",
        "leaf-sway": "leafSway 3s ease-in-out infinite",
        "fade-up": "fadeUp 0.5s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        bloomIn: {
          "0%": { transform: "scale(0) rotate(-10deg)", opacity: "0" },
          "60%": { transform: "scale(1.1) rotate(3deg)", opacity: "0.8" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        leafSway: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        fadeUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
