"use client";

import { BellOff } from "lucide-react";

/** Flyout panel: notifications (no notifications system yet — clean empty state). */
export default function NotificationsPanel() {
  return (
    <div>
      <h2 id="flyout-panel-title" className="text-white text-lg font-semibold mb-4">الإشعارات</h2>
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <span className="w-12 h-12 rounded-full bg-white/[0.06] grid place-items-center text-[#8A8A8A]">
          <BellOff size={20} />
        </span>
        <p className="text-[#8A8A8A] text-sm">لا توجد إشعارات جديدة حالياً.</p>
      </div>
    </div>
  );
}
