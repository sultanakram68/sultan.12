"use client";

import * as React from "react";
import { Home, LayoutGrid, ShoppingCart, Search } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/hooks/useSettings";

/**
 * Fixed bottom navigation (mobile only, official site). A floating fully
 * rounded (pill) glass-black bar. Icon-only so it reads the same in every
 * language. Search sits in the middle.
 */
export function BottomNav() {
  const { count, open } = useCart();
  const { settings } = useSettings();
  const wa = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`;

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  const itemClass =
    "flex-1 grid place-items-center py-3.5 text-white/65 hover:text-white active:scale-90 transition-all duration-200 outline-none focus-visible:text-white";

  return (
    <nav
      dir="rtl"
      aria-label="التنقل السفلي"
      className="md:hidden fixed inset-x-4 bottom-4 z-[90] flex items-stretch justify-around rounded-full bg-black/85 backdrop-blur-md text-white shadow-[0_12px_30px_rgba(0,0,0,0.3)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <button onClick={scrollTop} aria-label="الرئيسية" className={itemClass}>
        <Home className="w-[22px] h-[22px]" />
      </button>

      <button onClick={() => scrollTo("#crowd-favorites")} aria-label="المنتجات" className={itemClass}>
        <LayoutGrid className="w-[22px] h-[22px]" />
      </button>

      <button onClick={() => scrollTo("#crowd-favorites")} aria-label="بحث" className={itemClass}>
        <Search className="w-[22px] h-[22px]" />
      </button>

      <button onClick={open} aria-label="السلة" className={itemClass}>
        <span className="relative">
          <ShoppingCart className="w-[22px] h-[22px]" />
          {count > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-white text-black text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 grid place-items-center">
              {count}
            </span>
          )}
        </span>
      </button>

      <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="تواصل عبر واتساب" className={itemClass}>
        <span className="w-[22px] h-[22px] grid place-items-center">
          <WhatsAppIcon className="w-full h-full" />
        </span>
      </a>
    </nav>
  );
}
