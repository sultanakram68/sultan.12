"use client";

import * as React from "react";
import { X } from "lucide-react";

/**
 * Visual shell for the flyout: dark surface, strong shadow separating it from
 * the content behind, and a small close (X) button. The dynamic content is
 * passed in as children (see the panel registry).
 */
export function FlyoutPanel({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col bg-[#111111] border-l border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-start px-2 pt-2">
        <button
          onClick={onClose}
          aria-label="إغلاق البانل"
          className="grid place-items-center w-8 h-8 rounded-full text-[#8A8A8A] hover:text-white hover:bg-white/[0.06] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-5">{children}</div>
    </div>
  );
}
