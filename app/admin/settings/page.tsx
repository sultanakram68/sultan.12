"use client";

import React from "react";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">الإعدادات</h1>
        <p className="text-sm text-zinc-500 mt-1">إعدادات لوحة التحكم العامة.</p>
      </div>

      <div className="flex flex-col items-center justify-center text-center gap-3 py-20 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
        <Settings className="w-8 h-8" />
        <p className="text-sm">هذه الصفحة قيد الإعداد. قريباً راح تلاقي هون إعدادات لوحة التحكم.</p>
      </div>
    </div>
  );
}
