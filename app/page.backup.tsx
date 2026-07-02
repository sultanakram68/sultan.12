import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { CrowdFavorites } from "@/components/CrowdFavorites";
import { ProductDetails } from "@/components/ProductDetails";
import { ContactUs } from "@/components/ContactUs";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

/**
 * Main Landing Page Component (Server Component)
 */
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-neon-dark selection:bg-neon-green selection:text-neon-dark">
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Hero Banner Section */}
      <HeroSection />

      {/* Featured Devices Section (Fetches data from Sanity.io) */}
      <CrowdFavorites />

      {/* Services & Tech Specifications Section */}
      <ProductDetails />

      {/* Contact Us Section */}
      <ContactUs />

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Chat Button */}
      <WhatsAppButton />
    </main>
  );
}
