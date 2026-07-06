import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { CinematicSection } from "@/components/CinematicSection";
import { CrowdFavorites } from "@/components/CrowdFavorites";
import { ProductDetails } from "@/components/ProductDetails";
import { ContactUs } from "@/components/ContactUs";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

/**
 * Main Landing Page Component (Preserved at /store)
 */
export default function StorePage() {
  return (
    <main className="min-h-screen flex flex-col bg-neon-dark selection:bg-neon-green selection:text-neon-dark">
      <Navbar />
      <HeroSection />
      <CinematicSection />
      <CrowdFavorites />
      <ProductDetails />
      <ContactUs />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
