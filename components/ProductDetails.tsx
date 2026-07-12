"use client";

import * as React from "react";
import { ShieldCheck, Zap, Smartphone, Wifi } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/hooks/useSettings";

/**
 * Product Details Section
 */
export function ProductDetails() {
  const { t } = useLanguage();
  const { settings } = useSettings();

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-black" />,
      title: t("prod.f1.title"),
      description: t("prod.f1.desc"),
    },
    {
      icon: <Smartphone className="w-8 h-8 text-black" />,
      title: t("prod.f2.title"),
      description: t("prod.f2.desc"),
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-black" />,
      title: t("prod.f3.title"),
      description: t("prod.f3.desc"),
    },
    {
      icon: <Wifi className="w-8 h-8 text-black" />,
      title: t("prod.f4.title"),
      description: t("prod.f4.desc"),
    },
  ];

  return (
    <section id="product-details" className="py-20 bg-black/[0.02] relative scroll-mt-20 border-y border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-black/60 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-black/20 bg-black/[0.03] mb-4">
            {t("prod.badge")}
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-black tracking-tight">
            {t("prod.title")}
          </h2>
          <p className="text-gray-600 mt-4 text-base sm:text-lg">
            {t("prod.desc")}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, index) => (
            <Card key={index} className="bg-white border-black/10 hover:border-black/30 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6 flex flex-col sm:flex-row gap-6 items-start">
              <div className="p-4 rounded-2xl bg-black/[0.03] border border-black/15 shrink-0">
                {feat.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-black mb-2">{feat.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {feat.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Interactive Banner */}
        <div className="relative mt-16 rounded-3xl border border-black/15 overflow-hidden">
          <div className="relative rounded-3xl p-8 sm:p-12 bg-black flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left z-10">
            <div>
              <h4 className="text-2xl sm:text-3xl font-bold text-white">{t("prod.banner.title")}</h4>
              <p className="text-gray-400 mt-2 max-w-xl text-sm sm:text-base">
                {t("prod.banner.desc")}
              </p>
            </div>
            <a href={`https://wa.me/${settings.whatsappNumber || "905377903339"}`} target="_blank" rel="noopener noreferrer" className="shrink-0">
              <span className="inline-block px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-200 hover:scale-105 transition-all">
                {t("prod.banner.btn")}
              </span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
