"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Languages, Package, LogOut,
  Image as ImageIcon, Search, Bell, Activity, Settings, Store
} from "lucide-react";

const SIDEBAR_SECTIONS = [
  {
    title: "الرئيسية",
    items: [
      { name: "لوحة التحكم", icon: LayoutDashboard, href: "/admin" },
      { name: "الإحصائيات والأرباح", icon: Activity, href: "/admin/analytics" },
    ]
  },
  {
    title: "إدارة النظام",
    items: [
      { name: "المنتجات", icon: Package, href: "/admin/products" },
      { name: "الوسائط والإعدادات", icon: ImageIcon, href: "/admin/media" },
      { name: "الترجمة والنصوص", icon: Languages, href: "/admin/translations" },
    ]
  }
];

// Floating mobile bottom dock — the raised blue circle slides to and takes
// the icon of whichever item is currently active
const BOTTOM_NAV_ITEMS = [
  { name: "المخزون", icon: Package, href: "/admin/products" },
  { name: "الإحصائيات", icon: Activity, href: "/admin/analytics" },
  { name: "لوحة التحكم", icon: LayoutDashboard, href: "/admin" },
  { name: "الإعدادات", icon: Settings, href: "/admin/settings" },
  { name: "رجوع", icon: Store, href: "/" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const hasFirebaseKeys = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row font-sans selection:bg-neon-green selection:text-black overflow-hidden" dir="rtl">
      
      {/* Missing Keys Warning */}
      {!hasFirebaseKeys && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-500/10 backdrop-blur-md text-red-500 p-3 text-center font-semibold text-sm border-b border-red-500/20">
          ⚠️ السيرفر لا يملك مفاتيح قاعدة البيانات! يرجى إغلاق برنامج VS Code وإعادة تشغيله (ثم كتابة npm run dev) لكي تعمل أزرار الحفظ.
        </div>
      )}

      {/* Mobile Topbar */}
      <div className={`md:hidden flex items-center justify-center bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 p-4 sticky top-0 z-40 ${!hasFirebaseKeys ? "mt-[45px]" : ""}`}>
        <div className="w-32 h-12 relative flex items-center justify-center">
          <svg width="0" height="0" className="absolute hidden">
            <filter id="admin-mobile-logo-filter">
              <feColorMatrix
                type="matrix"
                values="
                  0 0 0 0 0.2235
                  0 0 0 0 1
                  0 0 0 0 0.0784
                  -1 -1 -1 0 2.5
                "
              />
            </filter>
          </svg>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sultan.logo.jpg"
            alt="Logo"
            className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]"
            style={{ filter: "url(#admin-mobile-logo-filter)", clipPath: "inset(3px)" }}
          />
        </div>
      </div>

      {/* Flat Bottom Nav (mobile only) — active item gets a soft highlighted pill, no floating circle */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xs">
        <div className="relative flex items-center justify-between bg-[#1c1c1e]/95 backdrop-blur-xl border border-zinc-800/60 rounded-full px-2 py-2 shadow-2xl shadow-black/60">
          {BOTTOM_NAV_ITEMS.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <Link key={i} href={item.href} className="relative flex-1">
                {isActive && (
                  <motion.div
                    layoutId="admin-dock-active"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-white"
                  />
                )}
                <div className="relative flex flex-col items-center gap-1 py-1.5">
                  <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-black" : "text-zinc-500"}`} />
                  <span className={`text-[10px] transition-colors ${isActive ? "text-black font-medium" : "text-zinc-500"}`}>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sidebar - Linear/Vercel Minimalist Design (desktop only) */}
      <aside className="
        hidden md:sticky md:flex top-0 right-0 h-screen overflow-y-auto custom-scrollbar
        w-64 bg-zinc-950 border-l border-zinc-800/50 flex-col z-50 shadow-none
      ">
        {/* Logo Area */}
        <div className="p-4 flex justify-center items-center border-b border-zinc-800/50">
          <div className="w-52 h-24 relative flex items-center justify-center">
            <svg width="0" height="0" className="absolute hidden">
              <filter id="admin-sidebar-logo-filter">
                <feColorMatrix
                  type="matrix"
                  values="
                    0 0 0 0 0.2235
                    0 0 0 0 1
                    0 0 0 0 0.0784
                    -1 -1 -1 0 2.5
                  "
                />
              </filter>
            </svg>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/sultan.logo.jpg" 
              alt="Sultan Mobile" 
              className="h-28 w-auto object-contain drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]" 
              style={{ filter: "url(#admin-sidebar-logo-filter)", clipPath: "inset(3px)" }}
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-4">
          <div className="relative group">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
            <input 
              type="text" 
              placeholder="البحث (Ctrl+K)" 
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md pr-9 pl-4 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 pb-6 space-y-6">
          {SIDEBAR_SECTIONS.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item, i) => {
                  const isActive = pathname === item.href && item.href !== "#";
                  return (
                    <Link key={i} href={item.href} className={`
                      flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative
                      ${isActive ? "bg-zinc-900 text-zinc-100 font-medium shadow-sm" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"}
                    `}>
                      {isActive && (
                        <motion.div layoutId="sidebar-active" className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-neon-green rounded-l-full" />
                      )}
                      <item.icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? "text-zinc-100" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User / Footer */}
        <div className="p-4 border-t border-zinc-800/50 bg-zinc-950">
          <button onClick={() => auth.signOut()} className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 w-full rounded-md transition-colors text-sm font-medium group">
            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-x-hidden flex flex-col">
        {/* Topbar Minimalist */}
        <header className="hidden md:flex sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50 px-8 h-14 items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
            <span className="hover:text-zinc-200 cursor-pointer transition-colors">لوحة التحكم</span>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-100">{pathname === '/admin' ? 'الرئيسية' : 'إدارة'}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-900">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-neon-green rounded-full" />
            </button>
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-zinc-500 transition-colors shadow-sm">
              <span className="text-[10px] font-bold text-zinc-300">SM</span>
            </div>
          </div>
        </header>

        {/* Content wrapper */}
        <div className="relative flex-1 p-4 pb-28 md:p-8 lg:p-10 md:pb-8 lg:pb-10">
          <div className="relative z-10 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a; /* zinc-800 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46; /* zinc-700 */
        }
      `}</style>
    </div>
  );
}
