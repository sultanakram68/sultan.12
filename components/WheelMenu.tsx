"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
  type PanInfo,
  type MotionValue,
} from "framer-motion";
export interface WheelMenuItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  avatarUrl?: string;
  active?: boolean;
  onSelect: () => void;
}

interface WheelMenuProps {
  items: WheelMenuItem[];
  isOpen: boolean;
  onClose: () => void;
}

const ITEM_HEIGHT = 74;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** Shortest signed distance (in item units) between an item's index and the current rotation, wrapping around the loop. */
function wrappedDelta(index: number, rotation: number, count: number) {
  let delta = (index - rotation) % count;
  if (delta > count / 2) delta -= count;
  if (delta < -count / 2) delta += count;
  return delta;
}

function WheelItem({
  item,
  index,
  count,
  rotation,
}: {
  item: WheelMenuItem;
  index: number;
  count: number;
  rotation: MotionValue<number>;
}) {
  const delta = useTransform(rotation, (r) => wrappedDelta(index, r, count));
  const absDelta = useTransform(delta, (d) => Math.abs(d));

  const y = useTransform(delta, (d) => d * ITEM_HEIGHT);
  const scale = useTransform(absDelta, [0, 1, 2, 3], [1, 0.82, 0.66, 0.5]);
  const opacity = useTransform(absDelta, [0, 1.4, 2.6, 3.4], [1, 0.7, 0.3, 0]);
  const rotateX = useTransform(delta, (d) => clamp(d * -14, -55, 55));
  const z = useTransform(absDelta, (d) => -d * 42);
  const x = useTransform(absDelta, (d) => d * 16);
  const blurPx = useTransform(absDelta, (d) => clamp(d * 1.4, 0, 4));
  const filter = useTransform(blurPx, (b) => `blur(${b.toFixed(2)}px)`);
  const glow = useTransform(absDelta, [0, 0.6, 1.2], [0.9, 0.3, 0]);

  const Icon = item.icon;

  return (
    <motion.button
      type="button"
      onClick={item.onSelect}
      style={{
        y,
        scale,
        rotateX,
        z,
        x,
        opacity,
        filter,
        left: "50%",
        marginLeft: -96,
        transformStyle: "preserve-3d",
      }}
      className={`group absolute top-1/2 -mt-[26px] flex items-center gap-3 w-48 h-[52px] pl-3 pr-4 rounded-2xl border backdrop-blur-xl overflow-hidden transition-colors ${
        item.active ? "border-black/60 bg-white" : "border-black/15 bg-white/90"
      }`}
    >
      <motion.span
        style={{ opacity: glow }}
        className="absolute inset-0 rounded-2xl bg-black/5 pointer-events-none"
        aria-hidden="true"
      />
      <span className="relative w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center shrink-0 overflow-hidden">
        {item.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <Icon className="w-[18px] h-[18px] text-black" />
        )}
      </span>
      <span className="relative text-sm font-medium text-black whitespace-nowrap truncate">
        {item.label}
      </span>
    </motion.button>
  );
}

/**
 * Ultra-premium infinite vertical wheel menu.
 * Drag/swipe vertically to spin the loop with momentum; release to snap to the nearest item.
 */
export function WheelMenu({ items, isOpen, onClose }: WheelMenuProps) {
  const rotation = useMotionValue(0);
  const count = items.length;

  const handlePan = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    rotation.set(rotation.get() - info.delta.y / ITEM_HEIGHT);
  };

  const handlePanEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    const velocity = -info.velocity.y / ITEM_HEIGHT;
    animate(rotation, rotation.get(), {
      type: "inertia",
      velocity,
      power: 0.5,
      timeConstant: 280,
      restDelta: 0.001,
      modifyTarget: (target: number) => Math.round(target),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            key="wheel-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Plain positioning wrapper — keeps the wheel centered on screen without fighting
              framer-motion's own transform (x/scale) on the inner animated element. */}
          <div
            className="fixed z-[55] w-56 h-[420px] pointer-events-none"
            style={{ left: "50%", top: "50%", marginLeft: -112, marginTop: -210 }}
          >
            <motion.div
              key="wheel-container"
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onPan={handlePan}
              onPanEnd={handlePanEnd}
              style={{
                perspective: 900,
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
              }}
              className="relative w-full h-full touch-none select-none pointer-events-auto"
            >
              {/* Lens / active-row highlight, evokes an Apple-style picker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-48 h-14 rounded-2xl bg-black/5 border border-black/10 shadow-[0_0_30px_rgba(0,0,0,0.05)] pointer-events-none"
                style={{ left: "50%", marginLeft: -96 }}
              />

              {items.map((item, idx) => (
                <WheelItem key={item.key} item={item} index={idx} count={count} rotation={rotation} />
              ))}
            </motion.div>
          </div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
