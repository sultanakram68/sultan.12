"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { railItems } from "./rail.config";
import { useRailFlyoutState } from "./useRailFlyoutState";

/** Placeholder while a panel lazily loads (keeps roughly the panel's footprint). */
function PanelSkeleton() {
  return (
    <div className="space-y-2 animate-pulse pt-1">
      <div className="h-5 w-20 rounded bg-black/10" />
      <div className="h-12 rounded-xl bg-black/[0.06]" />
      <div className="h-12 rounded-xl bg-black/[0.06]" />
    </div>
  );
}

/**
 * Icon Rail + Contextual Flyout (light glassmorphism). The panel is always
 * open — it starts on "Profile" and never fully closes; switching icons
 * cross-fades the inner content only (the container never resizes). The rail
 * and panel are two separate floating glass elements with a gap between them.
 *
 * Desktop (md+): floats on the right (RTL), panel to its left.
 * Mobile (<md): rail becomes a bottom bar with the always-visible panel card
 * sitting just above it.
 */
export function RailFlyoutNav() {
  const { activeId, selectItem } = useRailFlyoutState();
  const ActivePanel = railItems.find((i) => i.id === activeId)?.panelComponent;

  const railButtons = railItems.map((item) => {
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
  });

  // Cross-fade of inner content only (opacity); the container never resizes.
  const panelBody = (
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
  );

  return (
    <>
      {/* ===== Desktop: floating right, rail + panel separated by a gap ===== */}
      <div dir="rtl" className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-[60] gap-[10px] p-4 items-start">
        <nav aria-label="القائمة السريعة" className="limixi-glass rounded-2xl flex flex-col items-center gap-1.5 py-3 w-14 shrink-0">
          {railButtons}
        </nav>
        <div className="limixi-glass rounded-2xl w-[230px] max-h-[70vh] overflow-y-auto p-3.5">{panelBody}</div>
      </div>

      {/* ===== Mobile: bottom bar + always-visible panel card above it ===== */}
      <div dir="rtl" className="md:hidden fixed inset-x-0 bottom-0 z-[60] p-3 flex flex-col gap-[10px]" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
        <div className="limixi-glass rounded-2xl max-h-[42vh] overflow-y-auto p-3.5">{panelBody}</div>
        <nav aria-label="القائمة السريعة" className="limixi-glass rounded-2xl flex items-center justify-evenly py-2">
          {railButtons}
        </nav>
      </div>
    </>
  );
}
