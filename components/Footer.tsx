import * as React from "react";

/**
 * Footer Component
 */
export function Footer() {
  return (
    <footer className="bg-neon-dark border-t border-neon-border py-12 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#ff6700] drop-shadow-[0_0_6px_rgba(255,103,0,0.35)] flex items-center gap-1.5 tracking-[0.2em]">
            <span className="text-orange-400/80">❖</span>
            <span>SULTAN</span>
            <span className="text-orange-400/80">❖</span>
          </span>
          <span className="text-gray-600">|</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>

        <div className="flex gap-6 text-gray-400">
          <a href="#hero" className="hover:text-neon-green transition-colors">Top</a>
          <a href="#crowd-favorites" className="hover:text-neon-green transition-colors">Favorites</a>
          <a href="#product-details" className="hover:text-neon-green transition-colors">Specs</a>
          <a href="#contact-us" className="hover:text-neon-green transition-colors">Contact</a>
        </div>

        <div className="text-xs text-gray-500">
          Built for educational purposes with Next.js & Sanity.io
        </div>

      </div>
    </footer>
  );
}
