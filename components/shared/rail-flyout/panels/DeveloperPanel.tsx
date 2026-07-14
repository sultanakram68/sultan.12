"use client";

import { Sparkles, MessageCircle } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

const CARD = "rounded-xl border border-white/50 bg-white/35 p-3 mb-2";

/** Flyout panel: about the app / developer + a contact channel. */
export default function DeveloperPanel() {
  const { settings } = useSettings();
  const wa = `https://wa.me/${(settings.whatsappNumber || "").replace(/[^0-9]/g, "")}`;
  return (
    <div>
      <h2 className="text-[#1A1A18] text-base font-semibold mb-3">عن المطوّر</h2>
      <div className={CARD + " flex items-center gap-3"}>
        <span className="w-10 h-10 rounded-full bg-white/50 grid place-items-center text-[#2A2A28]">
          <Sparkles size={18} />
        </span>
        <div>
          <p className="text-[#1A1A18] text-sm font-semibold">LIMIXI</p>
          <p className="text-[#7A7A76] text-xs">متجر إلكتروني — تصميم وتطوير</p>
        </div>
      </div>
      <div className={CARD + " text-[#5C5C58] text-xs leading-relaxed"}>
        منصة تسوّق حديثة مبنية بأحدث التقنيات لتجربة استخدام سلسة وفاخرة.
      </div>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className={CARD + " flex items-center gap-2 text-sm text-[#5C5C58] hover:bg-white/45 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black/20"}
      >
        <MessageCircle size={15} /> تواصل مع الدعم
      </a>
    </div>
  );
}
