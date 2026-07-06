"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Users, Package, FileText, Settings, LogOut, Loader2, Menu, History } from "lucide-react";
import Script from "next/script";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Apply Dark Mode from Local Storage when in POS
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pos_dark_mode");
      if (saved !== "false") {
        localStorage.setItem("pos_dark_mode", "true");
        document.documentElement.classList.add("pos-dark-mode");
      } else {
        document.documentElement.classList.remove("pos-dark-mode");
      }
    }
    return () => {
      // Cleanup when navigating away from POS
      if (typeof window !== "undefined") {
        document.documentElement.classList.remove("pos-dark-mode");
      }
    };
  }, [pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        if (pathname !== "/pos/login") {
          router.push("/pos/login");
        }
      }
      setLoading(false);
    });
  }, [router, pathname]);

  useEffect(() => {
    // If entering POS site from outside/new and landing on /pos/dashboard, redirect to /pos
    if (typeof window !== "undefined") {
      const isInternalNav = sessionStorage.getItem("pos_internal_nav") === "true";
      if (window.location.pathname === "/pos/dashboard" && !isInternalNav) {
        router.replace("/pos");
      }
      sessionStorage.setItem("pos_internal_nav", "true");

      const handleUnload = () => {
        sessionStorage.removeItem("pos_internal_nav");
      };
      window.addEventListener("beforeunload", handleUnload);
      return () => window.removeEventListener("beforeunload", handleUnload);
    }
  }, [router]);

  useEffect(() => {
    // Eagerly prefetch all POS routes in the background for world-class instantaneous (0ms) navigation speed!
    const routes = [
      "/pos",
      "/pos/dashboard",
      "/pos/purchases",
      "/pos/customers",
      "/pos/reports",
      "/pos/history",
      "/pos/settings"
    ];
    routes.forEach(r => {
      try {
        router.prefetch(r);
      } catch (e) {}
    });
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/pos/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center" dir="rtl">
        <Loader2 className="w-12 h-12 text-[#1E3A8A] animate-spin" />
      </div>
    );
  }

  // If on login page, don't show sidebar
  if (pathname === "/pos/login") {
    return <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A]" dir="rtl">{children}</div>;
  }

  const menuItems = [
    { name: "الكاشير (POS)", icon: <ShoppingCart size={20} />, path: "/pos" },
    { name: "لوحة التحكم", icon: <LayoutDashboard size={20} />, path: "/pos/dashboard" },
    { name: "المشتريات والموردين", icon: <Package size={20} />, path: "/pos/purchases" },
    { name: "العملاء والديون", icon: <Users size={20} />, path: "/pos/customers" },
    { name: "التقارير", icon: <FileText size={20} />, path: "/pos/reports" },
    { name: "السجل وإدارة الإرجاع", icon: <History size={20} />, path: "/pos/history" },
    { name: "الإعدادات", icon: <Settings size={20} />, path: "/pos/settings" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex font-sans selection:bg-[#1E3A8A]/10 selection:text-[#1E3A8A] print:bg-white print:min-h-0 print:block" dir="rtl">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden print:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 right-0 h-full w-72 bg-white border-l border-slate-200 flex flex-col transition-transform duration-300 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] print:hidden ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        
        {/* SVG Filter for Logo */}
        <svg width="0" height="0" className="absolute hidden">
          <filter id="blue-logo-filter">
            <feColorMatrix
              type="matrix"
              values="
                0 0 0 0 0.1176
                0 0 0 0 0.2274
                0 0 0 0 0.5411
                -1 -1 -1 0 2.5
              "
            />
          </filter>
        </svg>

        {/* Logo Area */}
        <div className="h-32 flex items-center justify-center overflow-hidden">
          <Link
            href="/pos"
            title="العودة إلى شاشة الكاشير الرئيسية"
            className="block cursor-pointer transition-transform hover:scale-105"
          >
            <img 
              src="/sultan.logo.jpg" 
              alt="Logo" 
              className="h-28 w-auto pos-dark-ignore object-cover"
              style={{ 
                filter: "url(#blue-logo-filter)",
                clipPath: "inset(14%)",
                transform: "scale(1.4)"
              }}
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                prefetch={true}
                onMouseEnter={() => router.prefetch(item.path)}
                onTouchStart={() => router.prefetch(item.path)}
                onClick={() => {
                  if (typeof window !== "undefined") sessionStorage.setItem("pos_internal_nav", "true");
                  setSidebarOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 font-medium
                  ${isActive 
                    ? 'bg-[#1E3A8A]/5 text-[#1E3A8A] shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-[#0F172A] hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${isActive ? 'scale-110 drop-shadow-sm' : ''} transition-all`}>
                    {item.icon}
                  </div>
                  {item.name}
                </div>
                {isActive && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A] shadow-sm animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A] font-bold">
                {user?.email?.[0].toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-[#0F172A] truncate w-24">المدير العام</p>
                <p className="text-xs text-slate-500 truncate w-24">{user?.email || 'admin@pos.com'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden print:max-h-none print:overflow-visible print:block print:w-full">
        
        {/* Mobile Header */}
        <header className="lg:hidden h-24 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30 shadow-sm overflow-hidden print:hidden">
          <div className="flex items-center justify-center h-full overflow-hidden w-32 -ml-2">
            <Link
              href="/pos"
              title="العودة إلى شاشة الكاشير الرئيسية"
              className="block cursor-pointer transition-transform hover:scale-105"
            >
              <img 
                src="/sultan.logo.jpg" 
                alt="Logo" 
                className="h-20 w-auto pos-dark-ignore object-cover"
                style={{ 
                  filter: "url(#blue-logo-filter)",
                  clipPath: "inset(14%)",
                  transform: "scale(1.4)"
                }}
              />
            </Link>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-slate-50 text-slate-600 rounded-xl border border-slate-200"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 print:p-0 print:overflow-visible print:block">
          <div className="max-w-7xl mx-auto print:max-w-none print:w-full">
            {children}
          </div>
        </div>
      </main>
      <Script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js" strategy="afterInteractive" />
    </div>
  );
}
