"use client";

import * as React from "react";
import { Menu, X, Globe, ChevronDown, Check, Star, Layers, MapPin, ShoppingCart, User } from "lucide-react";
import { useLanguage, Language } from "@/context/LanguageContext";
import { Button } from "./ui/button";
import { useSession, signIn } from "next-auth/react";

/**
 * Navigation Bar Component
 * Mobile menu uses a radial/circular arc layout
 */
export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLangOpen, setIsLangOpen] = React.useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { data: session } = useSession();

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

  // All radial items: nav links + language + order
  const radialItems = [
    ...navLinks.map((link) => ({
      type: "nav" as const,
      label: link.name,
      icon: link.icon,
      href: link.href,
    })),
    {
      type: "lang" as const,
      label: languages.find((l) => l.code === language)?.label || "Language",
      icon: Globe,
      href: undefined,
    },
    {
      type: "profile" as const,
      label: session ? t("nav.profile") : t("nav.login"),
      icon: User,
      href: session ? "/profile" : undefined,
    },
    {
      type: "order" as const,
      label: t("nav.order"),
      icon: ShoppingCart,
      href: undefined,
    },
  ];

  // Calculate positions in a curved arc (centered on the right edge of the screen)
  const getRadialPosition = (index: number, total: number) => {
    // Arc spans from -85deg (top) to 85deg (bottom) to spread buttons further apart
    const startAngle = -85;
    const endAngle = 85;
    const angleStep = (endAngle - startAngle) / (total - 1);
    const angle = startAngle + angleStep * index;
    const rad = (angle * Math.PI) / 180;
    const radius = 175; // slightly increased distance from right edge for more breathing room

    return {
      x: -Math.cos(rad) * radius, // negative to go left from the right edge
      y: Math.sin(rad) * radius,
    };
  };

  // Close radial menu when clicking outside
  React.useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-radial-menu]")) {
        setIsOpen(false);
        setIsLangOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  // Close on escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsLangOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-neon-border bg-neon-dark/10 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
        
        {/* Desktop Navigation Links & Custom Language Dropdown (Left Aligned) */}
        <nav className="hidden md:flex items-center gap-8 flex-1">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="text-sm font-medium text-gray-300 hover:text-neon-green transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-neon-green hover:after:w-full after:transition-all"
            >
              {link.name}
            </a>
          ))}

          {/* Profile / Login Desktop */}
          {session ? (
            <a href="/profile" className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-neon-green transition-colors">
              {session.user?.image ? (
                <img src={session.user.image} alt="Profile" className="w-6 h-6 rounded-full border border-neon-green" />
              ) : (
                <User className="w-5 h-5 text-neon-green" />
              )}
              {t("nav.profile")}
            </a>
          ) : (
            <button onClick={() => signIn("google")} className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-neon-green transition-colors">
              <User className="w-5 h-5 text-neon-green" />
              {t("nav.login")}
            </button>
          )}

          {/* Sleek Custom Language Menu Item */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neon-green/40 bg-neon-green/5 hover:bg-neon-green/15 text-neon-green font-bold text-sm transition-all shadow-[0_0_15px_rgba(255,103,0,0.15)] focus:outline-none"
            >
              <Globe className="w-4 h-4" />
              <span>{languages.find(l => l.code === language)?.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLangOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Floating Glass Popup */}
            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                      language === lang.code
                        ? "bg-white text-black shadow-lg scale-105"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{lang.label}</span>
                    {language === lang.code && <Check className="w-4 h-4" />}
                  </button>
                ))}
                
                {/* OK Button */}
                <button
                  onClick={() => setIsLangOpen(false)}
                  className="mt-2 w-full bg-neon-green text-black font-black py-2 rounded-xl text-sm hover:bg-[#4bc122] transition-colors shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                >
                  {t("common.ok")}
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Center Logo Area */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex justify-center w-auto">
          <a href="#hero" className="block group">
            {/* SVG Filter to remove white background and colorize black text to #39ff14 (Neon Green) */}
            <svg width="0" height="0" className="absolute hidden">
              <filter id="green-logo-filter">
                <feColorMatrix
                  type="matrix"
                  values="
                    0 0 0 0 0.2235
                    0 0 0 0 1
                    0 0 0 0 0.0784
                    -1 -1 -1 0 2.5
                  "
                />
              </filter>
            </svg>
            <img 
              src="/sultan.logo.jpg" 
              alt="Sultan Logo" 
              className="h-32 w-auto object-contain drop-shadow-[0_0_15px_rgba(57,255,20,0.5)] transition-all duration-300 group-hover:drop-shadow-[0_0_25px_rgba(57,255,20,0.8)] group-hover:scale-105"
              style={{ filter: "url(#green-logo-filter)", clipPath: "inset(3px)" }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  e.currentTarget.nextElementSibling.classList.remove('hidden');
                  e.currentTarget.nextElementSibling.classList.add('flex');
                }
              }}
            />
            {/* Fallback Text Logo (hidden by default unless image fails to load) */}
            <span className="hidden text-3xl font-black text-neon-green drop-shadow-[0_0_10px_rgba(57,255,20,0.35)] items-center gap-2.5 transition-all duration-300 group-hover:drop-shadow-[0_0_16px_rgba(57,255,20,0.6)]">
              <span className="text-neon-green/80 text-2xl select-none animate-pulse">❖</span>
              <span className="tracking-[0.25em] font-extrabold">SULTAN</span>
              <span className="text-neon-green/80 text-2xl select-none animate-pulse">❖</span>
            </span>
          </a>
        </div>

        {/* Action Button & Mobile Menu (Right Aligned) */}
        <div className="flex items-center gap-4 justify-end flex-1">
          <div className="hidden md:flex items-center">
            <Button variant="neon" size="sm" onClick={() => window.open("https://wa.me/905377903339", "_blank")}>
              {t("nav.order")}
            </Button>
          </div>

          {/* Mobile Radial Menu */}
          <div className="md:hidden relative" data-radial-menu>
            {/* Menu Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
                if (isOpen) setIsLangOpen(false);
              }}
              className={`relative z-[60] p-3 rounded-full transition-all duration-500 focus:outline-none ${
                isOpen
                  ? "bg-neon-green text-neon-dark shadow-[0_0_30px_rgba(255,103,0,0.6)] rotate-90 scale-110"
                  : "text-gray-300 hover:text-neon-green hover:bg-white/5"
              }`}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Radial Menu Items moved outside header to fix fixed positioning container issues */}
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Radial Menu Items and Overlay (Rendered outside the header to ensure true fixed positioning relative to viewport) */}
    <div className="md:hidden" data-radial-menu>
      {/* Overlay backdrop */}
      <div
        className={`fixed inset-0 bg-neon-dark/70 backdrop-blur-md z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => {
          setIsOpen(false);
          setIsLangOpen(false);
        }}
      />

      {/* Decorative curved path SVG behind radial items */}
      <svg
        className={`fixed z-[54] pointer-events-none transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        style={{
          top: "50%",
          right: 0,
          transform: "translateY(-50%)",
          width: "250px",
          height: "500px",
        }}
      >
        <path
          d={`M 250 50 Q 50 250, 250 450`}
          fill="none"
          stroke="rgba(255, 103, 0, 0.12)"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="animate-pulse"
        />
      </svg>

      {/* Radial Menu Items */}
      {radialItems.map((item, idx) => {
        const pos = getRadialPosition(idx, radialItems.length);
        const delay = idx * 60;
        const Icon = item.icon;

        return (
          <div
            key={idx}
            className="fixed top-1/2 right-0 z-[55]"
            style={{
              transform: isOpen && !isLangOpen
                ? `translate(calc(-30px + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(1)`
                : `translate(100%, -50%) scale(0)`,
              opacity: isOpen && !isLangOpen ? 1 : 0,
              transition: `all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) ${delay}ms`,
              pointerEvents: isOpen && !isLangOpen ? "auto" : "none",
            }}
          >
            {/* Language item - shows sub-options on click */}
            {item.type === "lang" ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsLangOpen(!isLangOpen);
                  }}
                  className={`group flex flex-col items-center gap-1.5 transition-all duration-300`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-xl border-2 transition-all duration-300 shadow-lg hover:scale-110 ${
                      isLangOpen
                        ? "bg-neon-green text-neon-dark border-neon-green shadow-[0_0_25px_rgba(255,103,0,0.5)]"
                        : "bg-neon-dark/80 text-neon-green border-neon-green/40 hover:border-neon-green hover:shadow-[0_0_20px_rgba(255,103,0,0.3)]"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-300 whitespace-nowrap max-w-[80px] truncate">
                    {item.label}
                  </span>
                </button>

                  {/* Note: The sub-menu orbiting logic was removed. 
                      Instead, a centralized green pill menu handles language selection when isLangOpen is true. */}
              </div>
            ) : item.type === "order" ? (
              /* Order button */
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.open("https://wa.me/905377903339", "_blank");
                }}
                className="group flex flex-col items-center gap-1.5"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-neon-green text-neon-dark border-2 border-neon-green shadow-[0_0_25px_rgba(255,103,0,0.5)] hover:shadow-[0_0_35px_rgba(255,103,0,0.7)] transition-all duration-300 hover:scale-110 animate-pulse">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-neon-green whitespace-nowrap max-w-[80px] truncate">
                  {item.label}
                </span>
              </button>
            ) : item.type === "profile" ? (
              /* Profile / Login button */
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  if (session) {
                    window.location.href = "/profile";
                  } else {
                    signIn("google");
                  }
                }}
                className="group flex flex-col items-center gap-1.5"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-neon-dark/80 text-neon-green border-2 border-neon-green/40 hover:border-neon-green hover:shadow-[0_0_20px_rgba(255,103,0,0.3)] backdrop-blur-xl shadow-lg transition-all duration-300 hover:scale-110 overflow-hidden">
                  {session && session.user?.image ? (
                    <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span className="text-[11px] font-bold text-gray-300 group-hover:text-neon-green whitespace-nowrap max-w-[80px] truncate transition-colors">
                  {item.label}
                </span>
              </button>
            ) : (
              /* Regular nav items */
              <a
                href={item.href}
                onClick={() => {
                  setIsOpen(false);
                  setIsLangOpen(false);
                }}
                className="group flex flex-col items-center gap-1.5"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-neon-dark/80 text-neon-green border-2 border-neon-green/40 hover:border-neon-green hover:shadow-[0_0_20px_rgba(255,103,0,0.3)] backdrop-blur-xl shadow-lg transition-all duration-300 hover:scale-110">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-gray-300 group-hover:text-neon-green whitespace-nowrap max-w-[80px] truncate transition-colors">
                  {item.label}
                </span>
              </a>
            )}
          </div>
        );
      })}

      {/* Expanded Language Menu (Glassmorphism Frame) */}
      <div
        className="fixed bottom-0 left-0 w-full z-[70] flex flex-col gap-2 p-6 rounded-t-3xl bg-black/60 backdrop-blur-3xl border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]"
        style={{
          transform: (isOpen && isLangOpen) ? "translateY(0%)" : "translateY(100%)",
          opacity: (isOpen && isLangOpen) ? 1 : 0,
          transition: "all 0.5s cubic-bezier(0.32, 0.72, 0, 1)",
          pointerEvents: (isOpen && isLangOpen) ? "auto" : "none",
        }}
      >
        <div className="flex items-center justify-between px-3 pt-1 pb-2 border-b border-white/10 mb-1">
          <span className="text-white font-extrabold text-sm flex items-center gap-2">
            <Globe className="w-5 h-5 text-neon-green" /> Language
          </span>
          <button 
            onClick={() => setIsLangOpen(false)} 
            className="text-white/60 hover:text-white hover:scale-110 transition-transform bg-white/5 hover:bg-white/10 rounded-full p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code);
            }}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              language === lang.code
                ? "bg-white text-black shadow-lg scale-105"
                : "text-white hover:bg-white/10"
            }`}
          >
            <span>{lang.label}</span>
            {language === lang.code && <Check className="w-4 h-4" />}
          </button>
        ))}

        {/* OK Button */}
        <button
          onClick={() => {
            setIsLangOpen(false);
            setIsOpen(false);
          }}
          className="mt-1 w-full bg-neon-green text-black font-black py-2 rounded-xl text-sm hover:bg-[#4bc122] transition-colors shadow-[0_0_15px_rgba(57,255,20,0.3)]"
        >
          {t("common.ok")}
        </button>
      </div>
    </div>
    </>
  );
}
