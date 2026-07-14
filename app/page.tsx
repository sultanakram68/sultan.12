import * as React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { CrowdFavorites } from "@/components/CrowdFavorites";
import { WhatsAppButton } from "@/components/WhatsAppButton";

// أيقونة الموقع الرسمي فقط (شعار LMIXI أبيض على أسود) عند الإضافة للشاشة الرئيسية
export const metadata: Metadata = {
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
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Featured Devices Section (Real Firebase Data) */}
      <CrowdFavorites />

      {/* Floating WhatsApp Chat Button */}
      <WhatsAppButton />
    </main>
  );
}
