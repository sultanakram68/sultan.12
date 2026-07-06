import React from "react";

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden" dir="rtl">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col items-center justify-center gap-4 relative z-10 animate-in fade-in duration-300">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-white/10 border-t-[#1E3A8A] rounded-full animate-spin" />
          <div className="w-10 h-10 border-4 border-white/5 border-b-[#3b82f6] rounded-full animate-spin absolute" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
        
        <div className="text-center space-y-1 mt-2">
          <h2 className="text-sm font-bold tracking-wide text-white/90">جاري تحميل البيانات...</h2>
          <p className="text-[11px] text-slate-500 tracking-wider uppercase">Please wait a moment</p>
        </div>
      </div>
    </div>
  );
}
