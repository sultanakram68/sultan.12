"use client";

import * as React from "react";
import { Menu, X, Globe, ChevronDown, Check, Star, Layers, MapPin, User } from "lucide-react";
import { useLanguage, Language } from "@/context/LanguageContext";
import { Button } from "./ui/button";
import { useSession, signIn } from "next-auth/react";
import { useSettings } from "@/hooks/useSettings";
import { NavMenu } from "./NavMenu";
import { CartButton } from "./CartButton";
import { CartDrawer } from "./CartDrawer";

/**
 * Navigation Bar Component
 * Mobile menu is a full-screen premium overlay (see NavMenu)
 */
export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLangOpen, setIsLangOpen] = React.useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { settings } = useSettings();
  const { data: session } = useSession();

  // Safety: Always remove POS dark mode inversion filter when on official website!
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("pos-dark-mode");
    }
  }, []);

  // Lock background scroll/interaction while the radial menu is open
  React.useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isOpen]);

  const navLinks = [
    { name: t("nav.favorites"), href: "#crowd-favorites", icon: Star },
    { name: t("nav.details"), href: "#product-details", icon: Layers },
    { name: t("nav.contact"), href: "#contact-us", icon: MapPin },
  ];

  const languages = [
    { code: "de" as Language, label: "Deutsch" },
    { code: "ar" as Language, label: "العربية" },
    { code: "tr" as Language, label: "Türkçe" },
    { code: "en" as Language, label: "English" },
  ];

  // Navigate to an in-page anchor or a full route, then close the menu
  const goTo = (href: string) => {
    setIsOpen(false);
    setIsLangOpen(false);
    if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    } else if (href.startsWith("http")) {
      window.open(href, "_blank");
    } else {
      window.location.href = href;
    }
  };

  // Close the full-screen menu on escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Swipe up from the right screen edge opens the mobile menu
  React.useEffect(() => {
    const edgeWidth = 28;
    const openThreshold = 40;
    let startX: number | null = null;
    let startY: number | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch.clientX > window.innerWidth - edgeWidth) {
        startX = touch.clientX;
        startY = touch.clientY;
      } else {
        startX = null;
        startY = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY === null) return;
      const touch = e.touches[0];
      if (touch.clientY - startY < -openThreshold) {
        setIsOpen(true);
        startX = null;
        startY = null;
      }
    };

    const handleTouchEnd = () => {
      startX = null;
      startY = null;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-limixi-accent/10 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">

        {/* Mobile Radial Menu (Left Aligned) */}
        <div className="md:hidden relative shrink-0" data-radial-menu>
          {/* Menu Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
              if (isOpen) setIsLangOpen(false);
            }}
            className={`relative z-[60] p-3 rounded-full transition-all duration-500 focus:outline-none ${
              isOpen
                ? "bg-black text-white rotate-90 scale-110"
                : "text-gray-700 hover:text-black hover:bg-black/5"
            }`}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Radial Menu Items moved outside header to fix fixed positioning container issues */}
        </div>

        {/* Desktop Navigation Links & Custom Language Dropdown (Left Aligned) */}
        <nav className="hidden md:flex items-center gap-8 flex-1">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-black hover:after:w-full after:transition-all after:duration-300"
            >
              {link.name}
            </a>
          ))}

          {/* Profile / Login Desktop */}
          {session ? (
            <a href="/profile" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors">
              {session.user?.image ? (
                <img src={session.user.image} alt="Profile" className="w-6 h-6 rounded-full border border-black/30" />
              ) : (
                <User className="w-5 h-5" />
              )}
              {t("nav.profile")}
            </a>
          ) : (
            <button onClick={() => signIn("google")} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors">
              <User className="w-5 h-5" />
              {t("nav.login")}
            </button>
          )}

          {/* Sleek Custom Language Menu Item */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-black/15 bg-black/[0.03] hover:bg-black/[0.08] text-black font-medium text-sm transition-all duration-300 focus:outline-none"
            >
              <Globe className="w-4 h-4" />
              <span>{languages.find(l => l.code === language)?.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLangOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Floating Glass Popup */}
            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white/95 backdrop-blur-xl border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.15)] p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      language === lang.code
                        ? "bg-black text-white"
                        : "text-black hover:bg-black/5"
                    }`}
                  >
                    <span>{lang.label}</span>
                    {language === lang.code && <Check className="w-4 h-4" />}
                  </button>
                ))}

                {/* OK Button */}
                <button
                  onClick={() => setIsLangOpen(false)}
                  className="mt-2 w-full bg-black text-white font-semibold py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
                >
                  {t("common.ok")}
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Action Button & Logo (Right Aligned) */}
        <div className="flex items-center gap-2 sm:gap-4 justify-end flex-1">
          {/* Cart (visible on mobile + desktop) */}
          <CartButton />

          <div className="hidden md:flex items-center">
            <Button
              size="sm"
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => window.open(`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`, "_blank")}
            >
              {t("nav.order")}
            </Button>
          </div>

          {/* Logo */}
          <a href="#hero" className="flex items-center group shrink-0">
            <img
              src="/lmixi-logo-icon.png"
              alt="lmixi"
              className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  e.currentTarget.nextElementSibling.classList.remove('hidden');
                  e.currentTarget.nextElementSibling.classList.add('flex');
                }
              }}
            />
            {/* Fallback Text Logo (hidden by default unless image fails to load) */}
            <span className="hidden text-xl font-bold text-black items-center gap-2.5 transition-all duration-300">
              <span className="tracking-[0.05em] font-semibold">lmixi</span>
            </span>
          </a>
        </div>
      </div>
    </header>

    {/* Edge swipe handle hint (mobile only, hidden while menu is open) */}
    <div
      className={`md:hidden fixed right-0 top-1/2 -translate-y-1/2 z-[53] w-1.5 h-20 rounded-l-full bg-black/15 transition-opacity duration-300 ${
        isOpen ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    />

    {/* Full-screen premium navigation menu (mobile) */}
    <NavMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />

    {/* Slide-in shopping cart */}
    <CartDrawer />
    </>
  );
}
