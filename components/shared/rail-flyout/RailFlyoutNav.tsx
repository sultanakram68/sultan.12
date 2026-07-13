"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { railItems } from "./rail.config";
import { RailIconButton } from "./RailIconButton";
import { FlyoutPanel } from "./FlyoutPanel";
import { useOnClickOutside } from "./useOnClickOutside";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

/** Fixed-size placeholder shown while a panel's code lazily loads (no layout jump). */
function PanelSkeleton() {
  return (
    <div className="space-y-3 animate-pulse pt-2">
      <div className="h-6 w-24 rounded bg-white/10" />
      <div className="h-10 rounded-lg bg-white/[0.06]" />
      <div className="h-10 rounded-lg bg-white/[0.06]" />
      <div className="h-10 rounded-lg bg-white/[0.06]" />
    </div>
  );
}

/**
 * Icon Rail + Contextual Flyout navigation. A thin, always-visible rail of
 * independent icons; clicking one opens its own lazily-loaded panel. Only one
 * panel is open at a time; switching cross-fades the inner content while the
 * panel container stays put. Desktop only — mobile keeps its own bottom nav.
 */
export function RailFlyoutNav() {
  const reduceMotion = useReducedMotion() ?? false;
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const openerRef = React.useRef<HTMLButtonElement | null>(null);
  const buttonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());
  const prevActive = React.useRef<string | null>(null);

  const ActivePanel = railItems.find((i) => i.id === activeId)?.panel;

  const close = React.useCallback(() => setActiveId(null), []);

  const onSelect = React.useCallback((id: string) => {
    openerRef.current = buttonRefs.current.get(id) ?? null;
    setActiveId((prev) => (prev === id ? null : id)); // second click on the open icon = close
  }, []);

  const register = React.useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) buttonRefs.current.set(id, el);
    else buttonRefs.current.delete(id);
  }, []);

  useOnClickOutside(containerRef, close, activeId !== null);

  // Escape closes the panel
  React.useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeId, close]);

  // Focus management: move focus into the panel on open/switch; return it to
  // the opener rail button on close.
  React.useEffect(() => {
    const prev = prevActive.current;
    prevActive.current = activeId;
    if (activeId) {
      const t = window.setTimeout(() => {
        const first = panelRef.current?.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        first?.focus();
      }, 80);
      return () => window.clearTimeout(t);
    }
    if (prev) openerRef.current?.focus();
  }, [activeId]);

  return (
    <div
      ref={containerRef}
      dir="rtl"
      className="hidden md:flex fixed top-0 right-0 z-[60] h-screen flex-row items-stretch"
    >
      {/* Rail — always visible, fixed width */}
      <nav
        aria-label="القائمة الجانبية السريعة"
        className="w-16 h-full bg-[#0A0A0A] border-l border-white/[0.06] flex flex-col items-center gap-1 py-4"
      >
        {railItems.map((item) => (
          <RailIconButton
            key={item.id}
            item={item}
            active={activeId === item.id}
            onSelect={onSelect}
            register={register}
          />
        ))}
      </nav>

      {/* Flyout panel — appears only when an icon is active */}
      <AnimatePresence initial={false}>
        {activeId && (
          <motion.aside
            key="flyout"
            role="dialog"
            aria-labelledby="flyout-panel-title"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0.15 } : SPRING}
            className="h-full overflow-hidden"
          >
            {/* Fixed inner width so text doesn't reflow while the shell animates open */}
            <div ref={panelRef} className="h-full w-[320px]">
              <FlyoutPanel onClose={close}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeId}
                    initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
                    transition={{ duration: 0.16 }}
                  >
                    <React.Suspense fallback={<PanelSkeleton />}>
                      {ActivePanel && <ActivePanel />}
                    </React.Suspense>
                  </motion.div>
                </AnimatePresence>
              </FlyoutPanel>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
