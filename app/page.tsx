import * as React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { CrowdFavorites } from "@/components/CrowdFavorites";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { BottomNav } from "@/components/BottomNav";

// اسم + أيقونة الموقع الرسمي عند الإضافة للشاشة الرئيسية (شعار LMIXI أبيض على أسود)
// manifest بخلفية سوداء => شاشة إقلاع التطبيق سوداء (بدون برواز أبيض حول الأيقونة)
export const metadata: Metadata = {
  title: "Lmixi",
  manifest: "/site.webmanifest",
  appleWebApp: { capable: false, title: "Lmixi" },
  icons: {
    icon: "/lmixi-app-icon.jpg",
    shortcut: "/lmixi-app-icon.jpg",
    apple: "/lmixi-app-icon.jpg",
  },
};

/**
 * Main Official Landing Page Component (Disconnected from POS)
 */
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white pb-28 md:pb-0">
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Featured Devices Section (Real Firebase Data) */}
      <CrowdFavorites />

      {/* Floating WhatsApp Chat Button (desktop) */}
      <WhatsAppButton />

      {/* Fixed bottom navigation (mobile) */}
      <BottomNav />
    </main>
  );
}
