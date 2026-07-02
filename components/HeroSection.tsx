"use client";

import * as React from "react";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Headphones, Gift } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/hooks/useSettings";

/**
 * Hero Section Component
 */
export function HeroSection() {
  const { t } = useLanguage();
  const { settings } = useSettings();

  return (
    <section id="hero" className="relative overflow-hidden pt-12 lg:pt-20">
      {/* Background Glow Decorative Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-green/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight mb-8">
          {t("hero.title1")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green via-orange-400 to-amber-300 drop-shadow-[0_0_20px_rgba(255,103,0,0.5)]">{t("hero.title2")}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          {t("hero.desc")}
        </p>

        {/* Call To Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#crowd-favorites">
            <Button variant="neon" size="lg" className="w-full sm:w-auto gap-2">
              <span>{t("hero.explore")}</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
          <a href="#product-details">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              {t("nav.details")}
            </Button>
          </a>
        </div>
      </div>



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center pb-24 lg:pb-32">
        {/* Metrics Bar */}
        <div className="mt-4 pt-10 border-t border-neon-border/60 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div>
            <div className="text-3xl font-black text-neon-green">100%</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{t("hero.m1.label")}</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">4.9 ★</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{t("hero.m2.label")}</div>
          </div>
          <div>
            <div className="text-3xl font-black text-neon-green">24/7</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{t("hero.m3.label")}</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">15m</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{t("hero.m4.label")}</div>
          </div>
        </div>

      </div>

      {/* Full-Width Marquee Ticker Ribbon (Solid Neon Green) - Moved to bottom */}
      <div className="w-full overflow-hidden py-3 relative z-20 bg-[#5dd62c] shadow-[0_0_30px_rgba(93,214,44,0.4)] flex">
        <div className="animate-marquee flex items-center gap-12 text-base font-black whitespace-nowrap text-black relative z-10">
          {/* Set 1 */}
          <span className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> {t("hero.badge")}</span>
          <span className="opacity-40 font-black">❖</span>
          <span className="flex items-center gap-2"><Zap className="w-5 h-5" /> {settings.marqueeTexts[0]}</span>
          <span className="opacity-40 font-black">❖</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> {settings.marqueeTexts[1]}</span>
          <span className="opacity-40 font-black">❖</span>
          <span className="flex items-center gap-2"><Headphones className="w-5 h-5" /> {settings.marqueeTexts[2]}</span>
          <span className="opacity-40 font-black">❖</span>
          <span className="flex items-center gap-2"><Gift className="w-5 h-5" /> {settings.marqueeTexts[3]}</span>
          <span className="opacity-40 font-black">❖</span>
          
          {/* Set 2 */}
          <span className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> {t("hero.badge")}</span>
          <span className="opacity-40 font-black">❖</span>
          <span className="flex items-center gap-2"><Zap className="w-5 h-5" /> {settings.marqueeTexts[0]}</span>
          <span className="opacity-40 font-black">❖</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> {settings.marqueeTexts[1]}</span>
          <span className="opacity-40 font-black">❖</span>
          <span className="flex items-center gap-2"><Headphones className="w-5 h-5" /> {settings.marqueeTexts[2]}</span>
          <span className="opacity-40 font-black">❖</span>
          <span className="flex items-center gap-2"><Gift className="w-5 h-5" /> {settings.marqueeTexts[3]}</span>
          <span className="opacity-40 font-black">❖</span>
        </div>
      </div>
    </section>
  );
}
