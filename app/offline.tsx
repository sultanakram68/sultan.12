"use client";

import React from "react";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white flex flex-col items-center justify-center p-6 selection:bg-[#1E3A8A] selection:text-white relative overflow-hidden" dir="rtl">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-md w-full bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-8 lg:p-10 text-center relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-400 shadow-inner">
          <WifiOff size={40} className="animate-pulse" />
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-widest uppercase inline-block mb-4">
          No Internet Connection
        </span>

        <h1 className="text-3xl font-black mb-3 tracking-tight">انقطع الاتصال بالإنترنت</h1>
        
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          عذراً، يبدو أن جهازك فقد الاتصال بشبكة الإنترنت. يرجى التحقق من إعدادات الشبكة ومحاولة الاتصال مجدداً.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReload}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-[#0a0f0d] font-bold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] text-sm"
          >
            <RefreshCw size={18} />
            إعادة المحاولة
          </button>
          
          <Link
            href="/"
            className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] text-sm"
          >
            <Home size={18} />
            الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
