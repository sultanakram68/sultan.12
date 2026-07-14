"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * Opening launch screen (official website only). Pure black from the very
 * first paint — no framed image, no flash. The white LIMIXI mark eases in
 * with a soft breathing pulse over a thin progress line, then the curtain
 * fades to reveal the site (~3s). Also covers the brief gap while the
 * Firebase products stream in, so the catalog never looks empty.
 *
 * Strictly #000/#fff. No rotation, no glow, no particles. Respects
 * prefers-reduced-motion.
 */
export function SiteIntro() {
  const reduceMotion = useReducedMotion();
  const [show, setShow] = React.useState(true);
  // Paint the mark only after mount → first frame is pure black, no flash.
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    const t = window.setTimeout(() => setShow(false), reduceMotion ? 500 : 3000);
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
          className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          {mounted && (
            <>
              {/* White mark — its black bg merges seamlessly into the black stage */}
              <motion.img
                src="/lmixi-app-icon.jpg"
                alt="LIMIXI"
                className="w-32 h-32 object-contain select-none"
                style={{ mixBlendMode: "screen" }}
                draggable={false}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88 }}
                animate={
                  reduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, scale: [0.88, 1, 1.03, 1] }
                }
                transition={
                  reduceMotion
                    ? { duration: 0.3 }
                    : { duration: 2.4, ease: [0.22, 1, 0.36, 1], times: [0, 0.4, 0.7, 1] }
                }
              />

              {/* Thin progress line that fills over the launch */}
              {!reduceMotion && (
                <div className="mt-8 h-px w-40 bg-white/15 overflow-hidden rounded-full">
                  <motion.div
                    className="h-full bg-white/80"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.6, ease: "easeInOut" }}
                  />
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
