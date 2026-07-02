"use client";

import * as React from "react";
import { ShieldCheck, Zap, Smartphone, Wifi } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Product Details Section
 */
export function ProductDetails() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-neon-green" />,
      title: t("prod.f1.title"),
      description: t("prod.f1.desc"),
    },
    {
      icon: <Smartphone className="w-8 h-8 text-neon-green" />,
      title: t("prod.f2.title"),
      description: t("prod.f2.desc"),
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-neon-green" />,
      title: t("prod.f3.title"),
      description: t("prod.f3.desc"),
    },
    {
      icon: <Wifi className="w-8 h-8 text-neon-green" />,
      title: t("prod.f4.title"),
      description: t("prod.f4.desc"),
    },
  ];

  return (
    <section id="product-details" className="py-20 bg-neon-surface/30 relative scroll-mt-20 border-y border-neon-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-neon-green text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-neon-green/30 bg-neon-green/5 mb-4">
            {t("prod.badge")}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {t("prod.title")}
          </h2>
          <p className="text-gray-400 mt-4 text-base sm:text-lg">
            {t("prod.desc")}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, index) => (
            <Card key={index} className="bg-neon-dark/60 border-neon-border hover:border-neon-green/50 p-6 flex flex-col sm:flex-row gap-6 items-start">
              <div className="p-4 rounded-2xl bg-neon-green/10 border border-neon-green/30 shrink-0">
                {feat.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                  {feat.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Interactive Banner inside Product Details with Animated Moving Blurry Border */}
        <div className="relative mt-16 rounded-3xl p-[3px] overflow-hidden group shadow-[0_0_30px_rgba(255,103,0,0.3)]">
          {/* Moving Blurry Glow Effect */}
          <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,transparent_0_300deg,#ff6700_360deg)] animate-[spin_4s_linear_infinite] blur-md opacity-80 group-hover:opacity-100 transition-opacity" />
          
          {/* Card Content */}
          <div className="relative rounded-[22px] p-8 sm:p-12 bg-neon-dark/95 backdrop-blur-xl flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left z-10">
            <div>
              <h4 className="text-2xl sm:text-3xl font-black text-white">{t("prod.banner.title")}</h4>
              <p className="text-gray-300 mt-2 max-w-xl text-sm sm:text-base">
                {t("prod.banner.desc")}
              </p>
            </div>
            <a href="https://wa.me/905377903339" target="_blank" rel="noopener noreferrer" className="shrink-0">
              <span className="inline-block px-8 py-3 rounded-full bg-neon-green text-neon-dark font-extrabold shadow-neon-glow hover:bg-emerald-400 hover:scale-105 transition-all">
                {t("prod.banner.btn")}
              </span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
