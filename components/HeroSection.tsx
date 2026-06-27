import * as React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

/**
 * Hero Section Component
 * 
 * FOR STUDENTS:
 * This is the first thing users see. We use a dark glowing radial background gradient
 * paired with high-impact neon typography to immediately communicate the brand identity.
 */
export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
      {/* Background Glow Decorative Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-green/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-green/40 bg-neon-green/5 text-neon-green text-sm font-semibold mb-8 shadow-[0_0_15px_rgba(57,255,20,0.15)] animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Next-Gen Culinary Experience</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight mb-8">
          TASTE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green via-emerald-400 to-teal-300 drop-shadow-[0_0_20px_rgba(57,255,20,0.5)]">FUTURE</span> OF FLAVOR
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          Where cyberpunk aesthetics meet artisan gastronomy. Immerse your senses in glowing glazes, electric spices, and late-night culinary artistry.
        </p>

        {/* Call To Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#crowd-favorites">
            <Button variant="neon" size="lg" className="w-full sm:w-auto gap-2">
              <span>Explore Crowd Favorites</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
          <a href="#product-details">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Product Details
            </Button>
          </a>
        </div>

        {/* Metrics Bar */}
        <div className="mt-16 pt-10 border-t border-neon-border/60 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div>
            <div className="text-3xl font-black text-neon-green">100%</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Organic & Fresh</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">4.9 ★</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Crowd Rating</div>
          </div>
          <div>
            <div className="text-3xl font-black text-neon-green">24/7</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Neon Lounge Hours</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">15m</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Average Prep Time</div>
          </div>
        </div>

      </div>
    </section>
  );
}
