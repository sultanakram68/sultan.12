"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const faqKeys = ["warranty", "delivery", "return", "payment"] as const;

/**
 * Frequently Asked Questions Section
 */
export function FAQ() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-white relative scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-black/60 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-black/20 bg-black/[0.03] mb-4">
            {t("faq.badge")}
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-black tracking-tight">
            {t("faq.title")}
          </h2>
        </div>

        <div className="space-y-3">
          {faqKeys.map((key, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={key}
                className="rounded-2xl border border-black/10 bg-black/[0.02] overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-start"
                >
                  <span className="font-semibold text-black">{t(`faq.${key}.q`)}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-black/60 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className="grid transition-all duration-300"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-gray-600 leading-relaxed">
                      {t(`faq.${key}.a`)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
