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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 text-black text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-black/15 bg-black/[0.03] mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t("hero.badge")}</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-black max-w-5xl mx-auto leading-tight mb-8">
          {t("hero.title1")} <span className="text-black/50">{t("hero.title2")}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          {t("hero.desc")}
        </p>

        {/* Call To Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#crowd-favorites">
            <Button size="lg" className="w-full sm:w-auto gap-2 bg-black text-white hover:bg-gray-800">
              <span>{t("hero.explore")}</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
          <a href="#product-details">
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-black/30 text-black hover:bg-black/5">
              {t("nav.details")}
            </Button>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-24 lg:pb-32">
        {/* Metrics Cards */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { value: "100%", label: t("hero.m1.label") },
            { value: "4.9 ★", label: t("hero.m2.label") },
            { value: "24/7", label: t("hero.m3.label") },
            { value: "15m", label: t("hero.m4.label") },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-3xl border border-black/10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] px-4 py-6 text-center hover:border-black/25 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="text-2xl sm:text-3xl font-bold text-black">{stat.value}</div>
              <div className="text-[11px] text-gray-500 mt-1.5 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-Width Marquee Ticker Ribbon (Monochrome) - Moved to bottom */}
      <div className="w-full overflow-hidden py-3 relative z-20 bg-black flex">
        <div className="animate-marquee flex items-center gap-12 text-base font-semibold whitespace-nowrap text-white relative z-10">
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
