"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("System Error Caught by error.tsx:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white flex flex-col items-center justify-center p-6 selection:bg-[#1E3A8A] selection:text-white relative overflow-hidden" dir="rtl">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-8 lg:p-10 text-center relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-400 shadow-inner">
          <AlertTriangle size={40} className="animate-pulse" />
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold tracking-widest uppercase inline-block mb-4">
          500 System Error
        </span>

        <h1 className="text-3xl font-black mb-3 tracking-tight">حدث خطأ غير متوقع</h1>
        
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          عذراً، واجه النظام مشكلة مؤقتة أثناء معالجة طلبك. لقد تم تسجيل الخطأ وبإمكانك المحاولة مرة أخرى فوراً.
        </p>

        {error.message && (
          <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-3 mb-6 text-xs text-red-300 font-mono text-left break-all" dir="ltr">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] text-sm"
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
