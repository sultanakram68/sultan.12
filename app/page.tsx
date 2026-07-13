import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { CrowdFavorites } from "@/components/CrowdFavorites";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { RailFlyoutNav } from "@/components/shared/rail-flyout/RailFlyoutNav";

/**
 * Main Official Landing Page Component (Disconnected from POS)
 */
export default function HomePage() {
  return (
    <>
      {/* Icon rail + contextual flyout panels (desktop only) */}
      <RailFlyoutNav />

      {/* Content — padded on the inline-start (right, RTL) to clear the 64px rail on desktop */}
      <main className="min-h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white pb-16 md:pb-0 md:ps-16">
        {/* Sticky Navigation Bar */}
        <Navbar />

        {/* Featured Devices Section (Real Firebase Data) */}
        <CrowdFavorites />

        {/* Floating WhatsApp Chat Button */}
        <WhatsAppButton />
      </main>
    </>
  );
}
