"use client";

import * as React from "react";
import { Zap, Menu, X } from "lucide-react";
import { Button } from "./ui/button";

/**
 * Navigation Bar Component
 * 
 * FOR STUDENTS:
 * Notice the jump links (`#crowd-favorites`, `#product-details`, `#contact-us`).
 * Clicking these scrolls smoothly down to the matching section ID on the single-page landing loop!
 */
export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);

  const navLinks = [
    { name: "Crowd Favorites", href: "#crowd-favorites" },
    { name: "Product Details", href: "#product-details" },
    { name: "Contact Us", href: "#contact-us" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neon-border bg-neon-dark/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#hero" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-neon-green/10 border border-neon-green/30 group-hover:shadow-neon-glow transition-all">
            <Zap className="w-6 h-6 text-neon-green" />
          </div>
          <span className="text-2xl font-black tracking-wider text-white group-hover:text-neon-green transition-colors">
            NEON<span className="text-neon-green">BITES</span>
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-300 hover:text-neon-green transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-neon-green hover:after:w-full after:transition-all"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="neon" size="sm" onClick={() => window.location.href = "#crowd-favorites"}>
            Order Now
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-gray-300 hover:text-neon-green hover:bg-white/5 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-neon-border bg-neon-surface px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-neon-green hover:bg-neon-green/10 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2">
            <Button
              variant="neon"
              className="w-full"
              onClick={() => {
                setIsOpen(false);
                window.location.href = "#crowd-favorites";
              }}
            >
              Order Now
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
