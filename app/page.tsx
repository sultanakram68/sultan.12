import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { CrowdFavorites } from "@/components/CrowdFavorites";
import { ProductDetails } from "@/components/ProductDetails";
import { ContactUs } from "@/components/ContactUs";
import { Footer } from "@/components/Footer";

/**
 * Main Landing Page Component (Server Component)
 * 
 * FOR STUDENTS:
 * This component cleanly composes all our landing page sections in sequential loop order.
 * Notice how clean and readable this file is when components are modularized!
 */
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-neon-dark selection:bg-neon-green selection:text-neon-dark">
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Hero Banner Section */}
      <HeroSection />

      {/* Crowd Favorites Section (Fetches data from Sanity.io) */}
      <CrowdFavorites />

      {/* Product Details & Quality Specifications Section */}
      <ProductDetails />

      {/* Contact Us Section */}
      <ContactUs />

      {/* Footer */}
      <Footer />
    </main>
  );
}
