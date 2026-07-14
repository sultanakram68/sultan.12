"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * Cinematic opening intro (official website only) — logo only, no text.
 * A black curtain: concentric rings pulse outward from the LIMIXI mark over
 * a breathing glow; the mark springs in and keeps a soft heartbeat. After
 * ~3s the whole curtain punches in, blurs and fades to reveal the site.
 *
 * Decorative (fixed duration). Locks scroll while visible and fully respects
 * prefers-reduced-motion.
 */
export function SiteIntro() {
  const reduceMotion = useReducedMotion();
  const [show, setShow] = React.useState(true);

  React.useEffect(() => {
    const t = window.setTimeout(() => setShow(false), reduceMotion ? 600 : 2700);
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

  const rings = [0, 0.55, 1.1]; // staggered emanating pulses

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.12, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
        >
          {/* Breathing radial glow */}
          {!reduceMotion && (
            <motion.div
              aria-hidden="true"
              className="absolute w-[380px] h-[380px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.18), rgba(255,255,255,0) 70%)" }}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: [0, 1, 0.65, 0.85], scale: [0.75, 1.15, 1, 1.1] }}
              transition={{ duration: 2.7, ease: "easeInOut" }}
            />
          )}

          {/* Concentric rings emanating outward, continuously */}
          {!reduceMotion &&
            rings.map((delay, i) => (
              <motion.div
                key={i}
                aria-hidden="true"
                className="absolute rounded-full border border-white/25"
                style={{ width: 200, height: 200 }}
                initial={{ scale: 0.35, opacity: 0 }}
                animate={{ scale: [0.35, 2.4], opacity: [0, 0.6, 0] }}
                transition={{ duration: 2.2, ease: "easeOut", repeat: Infinity, delay }}
              />
            ))}

          {/* Logo mark — springs in, then a soft heartbeat */}
          <motion.div
            className="relative"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            transition={{ type: reduceMotion ? "tween" : "spring", stiffness: 140, damping: 12, duration: reduceMotion ? 0.4 : undefined }}
          >
            <motion.img
              src="/lmixi-app-icon.jpg"
              alt="LIMIXI"
              className="w-36 h-36 object-contain select-none drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]"
              draggable={false}
              animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }}
              transition={reduceMotion ? undefined : { duration: 1.6, ease: "easeInOut", repeat: Infinity, delay: 0.9 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
