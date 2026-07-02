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
        // Adessa Custom Palette
        neon: {
          orange: "#ff6700",
          emerald: "#ff6700",
          green: "#39ff14", // Added missing neon-green
          dark: "#0a0f0d",
          surface: "#121816",
          border: "#1f2b27",
        },
      },
      boxShadow: {
        "neon-glow": "0 0 15px rgba(255, 103, 0, 0.4)",
        "neon-glow-lg": "0 0 25px rgba(255, 103, 0, 0.6)",
      },
    },
  },
  plugins: [],
};
export default config;
