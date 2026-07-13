"use client";

import { Check } from "lucide-react";
import { useLanguage, type Language } from "@/context/LanguageContext";

const LANGS: { code: Language; label: string }[] = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
  { code: "de", label: "Deutsch" },
];

/** Flyout panel: language switcher. */
export default function LanguagePanel() {
  const { language, setLanguage } = useLanguage();
  return (
    <div>
      <h2 id="flyout-panel-title" className="text-white text-lg font-semibold mb-4">اللغة</h2>
      <div className="space-y-1">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
              language === l.code ? "bg-white/[0.08] text-white" : "text-[#8A8A8A] hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <span>{l.label}</span>
            {language === l.code && <Check size={16} />}
          </button>
        ))}
      </div>
    </div>
  );
}
