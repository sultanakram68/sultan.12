"use client";

import { BellOff } from "lucide-react";

/** Flyout panel: notifications (no notifications system yet — clean empty state). */
export default function NotificationsPanel() {
  return (
    <div>
      <h2 className="text-[#1A1A18] text-base font-semibold mb-3">الإشعارات</h2>
      <div className="rounded-xl border border-white/50 bg-white/35 p-5 flex flex-col items-center gap-2 text-center">
        <span className="w-10 h-10 rounded-full bg-white/50 grid place-items-center text-[#2A2A28]">
          <BellOff size={18} />
        </span>
        <p className="text-[#5C5C58] text-sm">لا توجد إشعارات جديدة حالياً.</p>
      </div>
    </div>
  );
}
