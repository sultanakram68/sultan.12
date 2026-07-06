"use client";

import React from "react";
import Link from "next/link";
import { Home, ArrowRight, Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white flex flex-col items-center justify-center p-6 selection:bg-[#1E3A8A] selection:text-white relative overflow-hidden" dir="rtl">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-8 lg:p-10 text-center relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-400 shadow-inner">
          <Compass size={40} className="animate-spin-slow" />
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase inline-block mb-4">
          404 Not Found
        </span>

        <h1 className="text-3xl font-black mb-3 tracking-tight">الصفحة غير موجودة</h1>
        
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          عذراً، يبدو أن الصفحة التي تحاول الوصول إليها غير متاحة أو تم نقلها إلى رابط آخر في النظام.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="w-full bg-white text-[#0a0f0d] hover:bg-slate-200 font-bold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] text-sm"
          >
            <Home size={18} />
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
