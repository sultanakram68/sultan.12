"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * Ultra-minimal premium opening intro (official website only).
 * Pure white stage. The black LIMIXI mark grows from a point at the center
 * via a smooth circular clip-reveal, holds, shows "Loading…" with a gentle
 * dot sequence, then scales up 2% and fades into the app. ~3s total.
 *
 * Palette strictly #000/#fff. No rotation, no glow, no particles. Fully
 * respects prefers-reduced-motion. (True vector self-drawing needs an SVG
 * source; with the raster mark this clip-reveal captures the same spirit.)
 */
export function SiteIntro() {
  const reduceMotion = useReducedMotion();
  const [show, setShow] = React.useState(true);

  React.useEffect(() => {
    const t = window.setTimeout(() => setShow(false), reduceMotion ? 500 : 2650);
    return () => window.clearTimeout(t);
  }, [reduceMotion]);

  React.useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Black mark — multiply drops the JPEG's white bg cleanly onto white */}
          <motion.img
            src="/lmixi-mark-black.jpg"
            alt="LIMIXI"
            className="w-32 h-32 object-contain select-none"
            style={{ mixBlendMode: "multiply" }}
            draggable={false}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.9, clipPath: "circle(0% at 50% 50%)" }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: [0.9, 1, 1.02], clipPath: "circle(72% at 50% 50%)" }
            }
            transition={
              reduceMotion
                ? { duration: 0.3 }
                : {
                    duration: 1.15,
                    ease: [0.22, 1, 0.36, 1],
                    scale: { duration: 2.6, times: [0, 0.45, 1], ease: [0.4, 0, 0.2, 1] },
                  }
            }
          />

          {/* Loading… with a gentle fade sequence on the dots */}
          {!reduceMotion && (
            <motion.div
              className="mt-9 flex items-center text-black/45 text-xs font-light"
              style={{ letterSpacing: "0.18em" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <span>Loading</span>
              <span className="flex">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.15, 1, 0.15] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 1 + i * 0.22, ease: "easeInOut" }}
                  >
                    .
                  </motion.span>
                ))}
              </span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
