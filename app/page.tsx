import * as React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { CrowdFavorites } from "@/components/CrowdFavorites";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SiteIntro } from "@/components/SiteIntro";

// اسم + أيقونة الموقع الرسمي عند الإضافة للشاشة الرئيسية (شعار LMIXI أبيض على أسود)
export const metadata: Metadata = {
  title: "Lmixi",
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
    <main className="min-h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white pb-16 md:pb-0">
      {/* Premium opening intro (~3s, official site only) */}
      <SiteIntro />

      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Featured Devices Section (Real Firebase Data) */}
      <CrowdFavorites />

      {/* Floating WhatsApp Chat Button */}
      <WhatsAppButton />
    </main>
  );
}
