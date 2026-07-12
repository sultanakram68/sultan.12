"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export interface LiquidNavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  avatarUrl?: string;
  onSelect: () => void;
}

interface LiquidBottomNavProps {
  /** The tabs the active-glow indicator travels between. */
  items: LiquidNavItem[];
  activeKey: string;
  onActiveChange: (key: string) => void;
  hidden?: boolean;
}

const SPRING = { type: "spring" as const, stiffness: 300, damping: 20, mass: 0.8 };
const GLOW_SIZE = 64;

/**
 * Bottom tab bar: a floating white glass pill, icon-only (no labels), black
 * icons. The active tab is marked with a soft black glow behind the icon —
 * not a solid fill — springing between tabs on a measured DOM position (not
 * array index: the site is Arabic/RTL, and dir="rtl" visually reverses flex
 * order, so index-based left% math puts the indicator over the wrong tab).
 */
export function LiquidBottomNav({ items, activeKey, onActiveChange, hidden }: LiquidBottomNavProps) {
  const reduceMotion = useReducedMotion();
  const [rippleKey, setRippleKey] = React.useState(0);
  const [glowLeft, setGlowLeft] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef(new Map<string, HTMLButtonElement>());

  const measure = React.useCallback(() => {
    const container = containerRef.current;
    const activeEl = itemRefs.current.get(activeKey);
    if (!container || !activeEl) return;
    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    const center = activeRect.left + activeRect.width / 2 - containerRect.left;
    setGlowLeft(center - GLOW_SIZE / 2);
  }, [activeKey]);

  React.useLayoutEffect(() => {
    measure();
  }, [measure]);

  React.useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <div
      className={`md:hidden fixed bottom-6 inset-x-0 z-50 flex justify-center transition-transform duration-300 ${
        hidden ? "translate-y-[calc(100%+2rem)]" : "translate-y-0"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="relative w-[90vw] max-w-[420px]">
        <div
          ref={containerRef}
          role="tablist"
          className="relative h-[64px] rounded-[32px] bg-white/85 [backdrop-filter:blur(20px)_saturate(180%)] border border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)] flex items-stretch overflow-visible"
        >
          {/* Soft glow behind the active tab — restrained, not a solid fill */}
          {glowLeft !== null && (
            <motion.div
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/10"
              style={{ filter: "blur(14px)" }}
              animate={{ left: glowLeft, opacity: reduceMotion ? 0.5 : 0.6 }}
              transition={reduceMotion ? { duration: 0.2 } : SPRING}
              onAnimationComplete={() => setRippleKey((k) => k + 1)}
            />
          )}

          {/* Ripple pulse on arrival */}
          <AnimatePresence>
            {!reduceMotion && glowLeft !== null && (
              <motion.div
                key={rippleKey}
                className="pointer-events-none absolute top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-black/20"
                style={{ left: glowLeft }}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.35, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>

          {/* Icon-only layer */}
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                ref={(el) => {
                  if (el) itemRefs.current.set(item.key, el);
                  else itemRefs.current.delete(item.key);
                }}
                role="tab"
                aria-selected={isActive}
                aria-label={item.label}
                onClick={() => {
                  onActiveChange(item.key);
                  item.onSelect();
                }}
                className="relative z-[1] flex-1 flex items-center justify-center min-w-[48px] min-h-[48px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black rounded-[24px]"
              >
                <motion.span
                  className="flex items-center justify-center w-6 h-6 rounded-full overflow-hidden"
                  animate={
                    isActive
                      ? { scale: 1.08, opacity: 1 }
                      : reduceMotion
                      ? { scale: 1, opacity: 0.55 }
                      : { scale: [0.98, 1, 0.98], opacity: 0.55 }
                  }
                  transition={
                    isActive
                      ? SPRING
                      : reduceMotion
                      ? { duration: 0.2 }
                      : { duration: 4, ease: "easeInOut", repeat: Infinity }
                  }
                >
                  {item.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive ? "text-black" : "text-black/50"}`} />
                  )}
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
