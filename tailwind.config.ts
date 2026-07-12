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
        // LIMIXI design system (Store front only — see design brief)
        limixi: {
          bg: "#F2F2E4",
          accent: "#00F5C9",
          dark: "#342E37",
          black: "#000000",
          blue: "#007AFF",
          success: "#3FD414",
          highlight: "#F7AD19",
        },
      },
      borderRadius: {
        "limixi-card": "32px 32px 48px 16px",
      },
      boxShadow: {
        "neon-glow": "0 0 15px rgba(255, 103, 0, 0.4)",
        "neon-glow-lg": "0 0 25px rgba(255, 103, 0, 0.6)",
        "limixi-card": "0 20px 40px -10px rgba(0,0,0,0.15), 0 4px 12px -4px rgba(0,0,0,0.08)",
        "limixi-glow": "0 0 24px rgba(0,245,201,0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
