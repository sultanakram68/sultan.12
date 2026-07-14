"use client";

import { UserCog, Store, LifeBuoy } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

const CARD = "rounded-xl border border-white/50 bg-white/35 p-3 mb-2 flex items-center gap-2 text-sm text-[#5C5C58] hover:bg-white/45 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black/20";

/** Flyout panel: quick settings / shortcuts (links to real destinations). */
export default function SettingsPanel() {
  const { settings } = useSettings();
  const wa = `https://wa.me/${(settings.whatsappNumber || "").replace(/[^0-9]/g, "")}`;
  return (
    <div>
      <h2 className="text-[#1A1A18] text-base font-semibold mb-3">الإعدادات</h2>
      <a href="/profile" className={CARD}>
        <UserCog size={15} /> إعدادات الحساب
      </a>
      <a href="/store" className={CARD}>
        <Store size={15} /> تصفّح المتجر
      </a>
      <a href={wa} target="_blank" rel="noopener noreferrer" className={CARD}>
        <LifeBuoy size={15} /> الدعم والمساعدة
      </a>
    </div>
  );
}
