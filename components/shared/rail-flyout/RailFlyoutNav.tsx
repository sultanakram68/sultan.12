"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
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
 * Icon Rail + Contextual Flyout navigation for the public site.
 *
 * Desktop (md+): a thin always-visible rail on the right (RTL); clicking an
 * icon opens its lazily-loaded panel to the left, flush against the rail.
 * Mobile (<md): the rail becomes a fixed bottom bar and the panel becomes a
 * drag-to-dismiss bottom sheet.
 *
 * Only one panel is open at a time; switching cross-fades the inner content
 * while the container stays put. No shared state/files with other nav patterns.
 */
export function RailFlyoutNav() {
  const reduceMotion = useReducedMotion() ?? false;
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const desktopRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const openerRef = React.useRef<HTMLButtonElement | null>(null);
  const buttonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());
  const prevActive = React.useRef<string | null>(null);

  const [isDesktop, setIsDesktop] = React.useState(false);

  const ActivePanel = railItems.find((i) => i.id === activeId)?.panel;

  const close = React.useCallback(() => setActiveId(null), []);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const onSelect = React.useCallback((id: string) => {
    openerRef.current = buttonRefs.current.get(id) ?? null;
    setActiveId((prev) => (prev === id ? null : id)); // second click on the open icon = close
  }, []);

  const register = React.useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) buttonRefs.current.set(id, el);
    else buttonRefs.current.delete(id);
  }, []);

  // Outside-click closes on desktop (rail+panel live inside desktopRef, so tapping
  // a different icon switches rather than closes). On mobile the backdrop handles it.
  useOnClickOutside(desktopRef, close, activeId !== null && isDesktop);

  // Escape closes
  React.useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeId, close]);

  // Lock background scroll while the mobile bottom sheet is open
  React.useEffect(() => {
    if (!activeId) return;
    if (typeof window === "undefined" || !window.matchMedia("(max-width: 767px)").matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [activeId]);

  // Focus management (desktop): into the panel on open/switch, back to the opener on close
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

  const onSheetDragEnd = (_e: unknown, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) close();
  };

  // Shared cross-fading panel body (container stays; only this swaps on switch)
  const panelBody = (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeId}
        initial={reduceMotion ? false : { opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
        transition={{ duration: 0.16 }}
      >
        <React.Suspense fallback={<PanelSkeleton />}>{ActivePanel && <ActivePanel />}</React.Suspense>
      </motion.div>
    </AnimatePresence>
  );

  const rail = railItems.map((item) => (
    <RailIconButton key={item.id} item={item} active={activeId === item.id} onSelect={onSelect} register={register} />
  ));

  return (
    <>
      {/* ===== Desktop: right rail + left flyout ===== */}
      <div
        ref={desktopRef}
        dir="rtl"
        className="hidden md:flex fixed top-0 right-0 z-[60] h-screen flex-row items-stretch"
      >
        <nav
          aria-label="القائمة الجانبية السريعة"
          className="w-16 h-full bg-[#0A0A0A] border-l border-white/[0.06] flex flex-col items-center gap-1 py-4"
        >
          {rail}
        </nav>

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
              <div ref={panelRef} className="h-full w-[320px]">
                <FlyoutPanel onClose={close}>{panelBody}</FlyoutPanel>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ===== Mobile: bottom bar + bottom sheet ===== */}
      {/* Bar sits above the backdrop (z-70) so it stays visible and tappable while a
          sheet is open — that's how you switch panels on mobile. */}
      <nav
        aria-label="القائمة السفلية السريعة"
        dir="rtl"
        className="md:hidden fixed bottom-0 inset-x-0 z-[70] h-16 bg-[#0A0A0A] border-t border-white/[0.06] flex items-center justify-evenly"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {rail}
      </nav>

      <AnimatePresence>
        {activeId && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-[62] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />
            <motion.aside
              dir="rtl"
              role="dialog"
              aria-labelledby="flyout-panel-title"
              className="md:hidden fixed inset-x-0 bottom-16 z-[65] max-h-[70vh] rounded-t-3xl bg-[#111111] border-t border-white/[0.08] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] flex flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={reduceMotion ? { duration: 0.2 } : SPRING}
              drag={reduceMotion ? false : "y"}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={onSheetDragEnd}
            >
              {/* Drag handle */}
              <div className="pt-3 pb-1 flex justify-center shrink-0">
                <span className="w-10 h-1.5 rounded-full bg-white/20" />
              </div>
              <div className="flex justify-start px-2 shrink-0">
                <button
                  onClick={close}
                  aria-label="إغلاق البانل"
                  className="grid place-items-center w-8 h-8 rounded-full text-[#8A8A8A] hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-8">{panelBody}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
