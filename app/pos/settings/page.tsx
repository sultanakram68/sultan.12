"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, Shield, Printer, Building2, Bell, Moon, Sun, History } from "lucide-react";
import { useRouter } from "next/navigation";

export default function POSSettingsCorporate() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLaserEnabled, setIsLaserEnabled] = useState(false);

  useEffect(() => {
    // Check initial state from document class or localStorage
    const saved = localStorage.getItem("pos_dark_mode");
    if (saved !== "false" || document.documentElement.classList.contains("pos-dark-mode")) {
      setIsDarkMode(true);
      document.documentElement.classList.add("pos-dark-mode");
    }
    if (localStorage.getItem("pos_laser_enabled") === "true") {
      setIsLaserEnabled(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    localStorage.setItem("pos_dark_mode", String(newVal));
    if (newVal) {
      document.documentElement.classList.add("pos-dark-mode");
    } else {
      document.documentElement.classList.remove("pos-dark-mode");
    }
  };

  const toggleLaser = () => {
    const newVal = !isLaserEnabled;
    setIsLaserEnabled(newVal);
    localStorage.setItem("pos_laser_enabled", String(newVal));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-100 max-w-4xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] mb-1">الإعدادات</h1>
          <p className="text-slate-500 font-medium">تخصيص النظام، الضرائب، ومعلومات المتجر</p>
        </div>
        <button className="bg-[#1E3A8A] hover:bg-[#152960] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2">
          <Save size={20} />
          حفظ التغييرات
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="md:col-span-1 space-y-2">
          <button className="w-full text-right px-4 py-3 rounded-lg font-bold bg-white text-[#1E3A8A] shadow-sm border border-slate-200 flex items-center gap-3">
            <Building2 size={18} /> المتجر والتصميم
          </button>
          <button className="w-full text-right px-4 py-3 rounded-lg font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-3">
            <Printer size={18} /> الفواتير
          </button>
          <button className="w-full text-right px-4 py-3 rounded-lg font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-3">
            <Shield size={18} /> الصلاحيات
          </button>
          <button className="w-full text-right px-4 py-3 rounded-lg font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-3">
            <Bell size={18} /> الإشعارات
          </button>
          <button onClick={() => router.push("/pos/history")} className="w-full text-right px-4 py-3 rounded-lg font-bold text-slate-500 hover:text-[#1E3A8A] hover:bg-slate-50 transition-colors flex items-center gap-3">
            <History size={18} /> السجل (History)
          </button>
        </div>

        <div className="md:col-span-3 space-y-6">
          
          {/* History & Returns Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
                <History className="text-[#1E3A8A]" size={22} /> السجل (سجل المبيعات والإرجاع)
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                عرض جميع فواتير البيع السابقة، تفاصيل المنتجات، إدارة الإرجاع واسترداد الأموال مع تحديث المخزون تلقائياً.
              </p>
            </div>
            <button
              onClick={() => router.push("/pos/history")}
              className="bg-[#1E3A8A] hover:bg-[#152960] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <History size={18} /> فتح سجل العمليات
            </button>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
               <h2 className="text-lg font-bold text-[#0F172A]">المظهر (Theme)</h2>
               <button 
                 onClick={toggleDarkMode} 
                 className={`relative w-16 h-8 rounded-full transition-colors flex items-center px-1 ${isDarkMode ? 'bg-[#1E3A8A]' : 'bg-slate-300'}`}
               >
                 <div className={`w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform transform ${isDarkMode ? 'translate-x-[-32px]' : 'translate-x-0'}`}>
                   {isDarkMode ? <Moon size={14} className="text-[#1E3A8A]" /> : <Sun size={14} className="text-amber-500" />}
                 </div>
               </button>
            </div>
            <p className="text-sm text-slate-500 mb-4 font-medium">قم بالتبديل بين الوضع الفاتح والداكن (يعمل على جميع شاشات النظام فوراً بفضل خاصية الانعكاس الذكي).</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
               <h2 className="text-lg font-bold text-[#0F172A]">قارئ الليزر (Laser Scanner Mode)</h2>
               <button 
                 onClick={toggleLaser} 
                 className={`relative w-16 h-8 rounded-full transition-colors flex items-center px-1 ${isLaserEnabled ? 'bg-[#1E3A8A]' : 'bg-slate-300'}`}
               >
                 <div className={`w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform transform ${isLaserEnabled ? 'translate-x-[-32px]' : 'translate-x-0'}`} />
               </button>
            </div>
            <p className="text-sm text-slate-500 mb-2 font-medium">تفعيل وإظهار زر وضع قارئ الليزر في شاشة الكاشير الرئيسية.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#0F172A] mb-4 pb-3 border-b border-slate-100">المعلومات الأساسية</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم المتجر / الشركة</label>
                <input type="text" defaultValue="متجري العظيم" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] focus:bg-white outline-none transition-colors font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">رقم الهاتف</label>
                <input type="text" defaultValue="+966 50 000 0000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] focus:bg-white outline-none transition-colors font-mono text-left" dir="ltr" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">العنوان الكامل</label>
                <input type="text" defaultValue="الرياض، المملكة العربية السعودية" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] focus:bg-white outline-none transition-colors" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#0F172A] mb-4 pb-3 border-b border-slate-100">الضرائب المضافة</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">نسبة الضريبة الافتراضية (%)</label>
                <input type="number" defaultValue="15" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] focus:bg-white outline-none transition-colors font-bold text-left" dir="ltr" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="tax_inc" defaultChecked className="w-5 h-5 accent-[#1E3A8A] rounded border-slate-300" />
                <label htmlFor="tax_inc" className="text-sm font-bold text-slate-700 cursor-pointer">الأسعار تشمل الضريبة المضافة (Tax Inclusive)</label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
