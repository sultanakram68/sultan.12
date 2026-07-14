import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * Root Layout Component
 * 
 * FOR STUDENTS:
 * In Next.js App Router, `layout.tsx` wraps every page inside the directory.
 * Metadata here automatically defines SEO tags (<title>, <meta name="description">) for Google and social sharing.
 */
export const metadata: Metadata = {
  title: "Sultan | Next-Gen Mobile & Tech Hub",
  description: "Top-tier smartphones, glowing gaming accessories, instant credit top-ups, and certified pre-owned devices.",
};

// إعدادات الشاشة لهواتف الجوال: إلغاء التأخير الزمني للنقرات (0ms tap delay) لسرعة استجابة صاعقة!
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0f0d",
};

import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/components/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        {/* الاتصال المسبق بسيرفرات الصور والبيانات لتسريع التحميل على الجوال */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="min-h-screen bg-neon-dark text-white font-sans antialiased selection:bg-neon-green selection:text-neon-dark">
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>{children}</CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
