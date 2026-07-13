"use client";

import * as React from "react";
import type { RailItem } from "./rail.config";

interface Props {
  item: RailItem;
  active: boolean;
  onSelect: (id: string) => void;
  register: (id: string, el: HTMLButtonElement | null) => void;
}

/**
 * One rail icon. Memoized (with stable onSelect/register from the parent) so
 * switching the active panel only re-renders the two buttons whose active
 * state actually changed, not the whole rail.
 */
function RailIconButtonBase({ item, active, onSelect, register }: Props) {
  const Icon = item.icon;
  return (
    <button
      ref={(el) => register(item.id, el)}
      onClick={() => onSelect(item.id)}
      aria-pressed={active}
      aria-label={item.labelAr}
      className={`relative grid place-items-center w-11 h-11 rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
        active ? "bg-white/[0.08] text-white" : "text-[#6B6B6B] hover:text-[#B0B0B0]"
      }`}
    >
      <Icon size={20} />
    </button>
  );
}

export const RailIconButton = React.memo(RailIconButtonBase);
