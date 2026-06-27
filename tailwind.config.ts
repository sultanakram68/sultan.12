import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neon Bites Custom Palette
        neon: {
          green: "#39FF14",
          emerald: "#00FF66",
          dark: "#0a0f0d",
          surface: "#121816",
          border: "#1f2b27",
        },
      },
      boxShadow: {
        "neon-glow": "0 0 15px rgba(57, 255, 20, 0.4)",
        "neon-glow-lg": "0 0 25px rgba(57, 255, 20, 0.6)",
      },
    },
  },
  plugins: [],
};
export default config;
