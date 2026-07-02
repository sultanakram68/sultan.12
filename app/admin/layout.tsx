"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { LayoutDashboard, Languages, Package, Settings, LogOut, Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans text-blue-600 font-bold">جاري التحقق...</div>;
  }

  const navLinkClass = (path: string) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-semibold text-sm ${pathname === path ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900" dir="rtl">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <h1 className="text-xl font-black text-blue-600">لوحة تحكم</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 bg-gray-50 rounded-lg border border-gray-200"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-900/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 right-0 h-screen overflow-y-auto
        w-64 bg-white border-l border-gray-200 p-6 flex flex-col gap-2 shadow-xl md:shadow-sm z-50
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
      `}>
        <div className="flex flex-col items-center justify-center mb-10 pt-4">
          <div className="w-40 bg-blue-600 relative flex items-center justify-center">
            <img 
              src="/sultan.logo.jpg" 
              alt="لوحة تحكم" 
              className="w-full h-auto object-contain mix-blend-screen"
            />
          </div>
          <h2 className="text-xl font-black text-blue-600 tracking-wide mt-4">
            لوحة تحكم
          </h2>
        </div>
        
        <Link href="/admin" className={navLinkClass("/admin")}>
          <LayoutDashboard size={18} />
          الرئيسية
        </Link>
        <Link href="/admin/translations" className={navLinkClass("/admin/translations")}>
          <Languages size={18} />
          نصوص الموقع
        </Link>
        <Link href="/admin/products" className={navLinkClass("/admin/products")}>
          <Package size={18} />
          إدارة المنتجات
        </Link>
        <Link href="/admin/media" className={navLinkClass("/admin/media")}>
          <Settings size={18} />
          الإعدادات والوسائط
        </Link>
        
        <div className="mt-auto pt-6 border-t border-gray-200">
          <button onClick={() => auth.signOut()} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 w-full rounded-lg transition-colors font-semibold text-sm text-right">
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
