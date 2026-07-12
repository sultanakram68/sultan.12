import * as React from "react";

/**
 * Footer Component
 */
export function Footer() {
  return (
    <footer className="bg-white border-t border-black/10 py-12 text-gray-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">

        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lmixi-logo-icon.png" alt="lmixi" className="h-5 w-auto object-contain" />
          <span className="text-gray-300">|</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>

        <div className="flex gap-6 text-gray-600">
          <a href="#hero" className="hover:text-black transition-colors">Top</a>
          <a href="#crowd-favorites" className="hover:text-black transition-colors">Favorites</a>
          <a href="#product-details" className="hover:text-black transition-colors">Specs</a>
          <a href="#contact-us" className="hover:text-black transition-colors">Contact</a>
        </div>

        <div className="text-xs text-gray-400">
          Built for educational purposes with Next.js & Sanity.io
        </div>

      </div>
    </footer>
  );
}
