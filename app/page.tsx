import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { CrowdFavorites } from "@/components/CrowdFavorites";
import { ProductDetails } from "@/components/ProductDetails";
import { FAQ } from "@/components/FAQ";
import { ContactUs } from "@/components/ContactUs";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

/**
 * Main Official Landing Page Component (Disconnected from POS)
 */
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white pb-16 md:pb-0">
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Hero Banner Section */}
      <HeroSection />

      {/* Featured Devices Section (Real Firebase Data) */}
      <CrowdFavorites />

      {/* Services & Tech Specifications Section */}
      <ProductDetails />

      {/* Frequently Asked Questions */}
      <FAQ />

      {/* Contact Us Section */}
      <ContactUs />

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Chat Button */}
      <WhatsAppButton />
    </main>
  );
}
