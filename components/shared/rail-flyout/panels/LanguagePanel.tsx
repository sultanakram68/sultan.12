"use client";

import { Check } from "lucide-react";
import { useLanguage, type Language } from "@/context/LanguageContext";

const LANGS: { code: Language; label: string }[] = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
  { code: "de", label: "Deutsch" },
];

/** Flyout panel: language switcher (each option is its own card). */
export default function LanguagePanel() {
  const { language, setLanguage } = useLanguage();
  return (
    <div>
      <h2 className="text-[#1A1A18] text-base font-semibold mb-3">اللغة</h2>
      {LANGS.map((l) => {
        const active = language === l.code;
        return (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            aria-pressed={active}
            className={`w-full text-right rounded-xl border p-3 mb-2 text-sm flex items-center justify-between transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${
              active ? "bg-white/55 border-white/70 text-[#1A1A18] font-semibold" : "bg-white/35 border-white/50 text-[#5C5C58] hover:bg-white/45"
            }`}
          >
            <span>{l.label}</span>
            {active && <Check size={15} />}
          </button>
        );
      })}
    </div>
  );
}
