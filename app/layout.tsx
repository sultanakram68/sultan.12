import type { Metadata } from "next";
import "./globals.css";

/**
 * Root Layout Component
 * 
 * FOR STUDENTS:
 * In Next.js App Router, `layout.tsx` wraps every page inside the directory.
 * Metadata here automatically defines SEO tags (<title>, <meta name="description">) for Google and social sharing.
 */
export const metadata = {
  title: "Sultan | Next-Gen Mobile & Tech Hub",
  description: "Top-tier smartphones, glowing gaming accessories, instant credit top-ups, and certified pre-owned devices.",
};

import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/components/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-neon-dark text-white font-sans antialiased selection:bg-neon-green selection:text-neon-dark">
        <AuthProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
