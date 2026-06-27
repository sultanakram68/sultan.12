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
  title: "Neon Bites | Next-Gen Cyberpunk Gastronomy",
  description: "Experience glowing culinary artistry, molecular infusions, and neon flavors. Built with Next.js & Sanity.io.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-neon-dark text-white font-sans antialiased selection:bg-neon-green selection:text-neon-dark">
        {children}
      </body>
    </html>
  );
}
