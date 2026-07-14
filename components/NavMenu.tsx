"use client";

import * as React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { railItems } from "@/components/shared/rail-flyout/rail.config";
import { useRailFlyoutState } from "@/components/shared/rail-flyout/useRailFlyoutState";

/** Placeholder while a panel lazily loads (keeps roughly the panel's footprint). */
function PanelSkeleton() {
  return (
    <div className="space-y-2 animate-pulse pt-1">
      <div className="h-5 w-24 rounded bg-black/10" />
      <div className="h-14 rounded-xl bg-black/[0.06]" />
      <div className="h-14 rounded-xl bg-black/[0.06]" />
    </div>
  );
}

/**
 * Full-screen navigation overlay (mobile only). The menu IS the Rail + Flyout:
 * a thin icon rail on the right (RTL) with a glass panel filling the rest.
 * The panel is always open — it starts on "Profile" and never closes; tapping
 * a different icon cross-fades the inner content only.
 */
export function NavMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const reduceMotion = useReducedMotion();
  const { activeId, selectItem } = useRailFlyoutState();
  const ActivePanel = railItems.find((i) => i.id === activeId)?.panelComponent;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          dir="rtl"
          className="md:hidden fixed inset-0 z-[100] flex flex-col"
          style={{ background: "linear-gradient(135deg, #E8E6DD, #D8D4C8)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header: logo + close */}
          <div
            className="relative flex items-center justify-between px-5 pb-3"
            style={{ paddingTop: "calc(env(safe-area-inset-top) + 18px)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/lmixi-logo-icon.png" alt="LMIXI" className="h-7 w-auto object-contain" />
            <button
              onClick={onClose}
              aria-label="إغلاق القائمة"
              className="w-11 h-11 rounded-full bg-white/50 text-[#2A2A28] flex items-center justify-center hover:bg-white/70 transition-colors duration-300 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: rail (right) + always-visible glass panel (fills) */}
          <div
            className="flex-1 min-h-0 flex gap-[10px] px-4 pt-1"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
          >
            <nav
              aria-label="القائمة السريعة"
              className="limixi-glass rounded-2xl flex flex-col items-center gap-1.5 py-3 w-14 shrink-0"
            >
              {railItems.map((item) => {
                const active = item.id === activeId;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => selectItem(item.id)}
                    aria-pressed={active}
                    aria-label={item.label}
                    className="grid place-items-center w-9 h-9 rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                    style={{ background: active ? "rgba(255,255,255,0.5)" : "transparent", color: "#2A2A28" }}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </nav>

            <div className="limixi-glass rounded-2xl flex-1 min-w-0 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeId}
                  role="region"
                  aria-live="polite"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <React.Suspense fallback={<PanelSkeleton />}>{ActivePanel && <ActivePanel />}</React.Suspense>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
