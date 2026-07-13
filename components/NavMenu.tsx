"use client";

import * as React from "react";
import { X, User } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import { useLanguage, Language } from "@/context/LanguageContext";
import { useSettings } from "@/hooks/useSettings";

interface NavMenuItem {
  key: string;
  label: string;
  /** Real navigation. Omit for not-yet-built features — those show a "coming soon" toast instead. */
  onSelect?: () => void;
}

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
  { code: "de", label: "Deutsch" },
];

/**
 * Full-screen premium navigation overlay (design brief: Apple/Linear/Arc-tier,
 * strictly white/black/gray palette, no sidebar). Replaces the old radial
 * WheelMenu. Mobile only — the desktop header keeps its own inline nav.
 */
export function NavMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const reduceMotion = useReducedMotion();
  const { language, setLanguage } = useLanguage();
  const { data: session } = useSession();
  const { settings } = useSettings();
  const [toast, setToast] = React.useState<string | null>(null);
  const isRTL = language === "ar";

  const goTo = (href: string) => {
    onClose();
    if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    } else if (href.startsWith("http")) {
      window.open(href, "_blank");
    } else {
      window.location.href = href;
    }
  };

  const comingSoon = (label: string) => {
    setToast(`${label} — قريباً`);
    window.setTimeout(() => setToast(null), 1800);
  };

  const items: NavMenuItem[] = [
    { key: "home", label: "الرئيسية", onSelect: () => goTo("/") },
    { key: "categories", label: "الأقسام", onSelect: () => goTo("/store") },
    { key: "products", label: "المنتجات", onSelect: () => goTo("#crowd-favorites") },
    { key: "offers", label: "العروض", onSelect: () => goTo("#crowd-favorites") },
    { key: "favorites", label: "المفضلة" },
    { key: "orders", label: "طلباتي" },
    { key: "notifications", label: "الإشعارات" },
    {
      key: "support",
      label: "الدعم الفني",
      onSelect: () => goTo(`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`),
    },
    { key: "settings", label: "الإعدادات", onSelect: () => goTo("/profile") },
  ];

  const handleSelect = (item: NavMenuItem) => {
    if (item.onSelect) item.onSelect();
    else comingSoon(item.label);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="md:hidden fixed inset-0 z-[100] bg-white/95 backdrop-blur-2xl flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="relative flex items-center justify-between px-6 pb-4"
            style={{ paddingTop: "calc(env(safe-area-inset-top) + 20px)" }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.05, duration: 0.35 }}
          >
            <img src="/lmixi-logo-icon.png" alt="LMIXI" className="h-7 w-auto object-contain" />
            <button
              onClick={onClose}
              aria-label="إغلاق القائمة"
              className="w-11 h-11 rounded-full bg-[#EAEAEA] text-[#111111] flex items-center justify-center hover:bg-[#111111] hover:text-white transition-colors duration-300 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>

          <nav className="flex-1 overflow-y-auto px-6 flex flex-col justify-center gap-0.5" role="menu">
            {items.map((item, i) => (
              <motion.button
                key={item.key}
                role="menuitem"
                onClick={() => handleSelect(item)}
                className="group relative flex items-center gap-4 py-3.5 text-right w-fit"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: reduceMotion ? 0 : 0.1 + i * 0.045,
                  duration: reduceMotion ? 0.15 : 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <span
                  className={`text-3xl sm:text-4xl font-semibold text-[#111111] transition-transform duration-300 ease-out motion-reduce:transition-none ${
                    isRTL ? "group-hover:-translate-x-2 group-active:-translate-x-1" : "group-hover:translate-x-2 group-active:translate-x-1"
                  }`}
                >
                  {item.label}
                </span>
                <span className="h-px bg-[#111111] w-0 group-hover:w-8 transition-all duration-300 ease-out motion-reduce:hidden" />
              </motion.button>
            ))}
          </nav>

          <motion.div
            className="px-6 pt-4 space-y-4 border-t border-[#EAEAEA]"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.4, duration: 0.4 }}
          >
            {/* Account */}
            <button
              onClick={() => {
                onClose();
                if (session) window.location.href = "/profile";
                else signIn("google");
              }}
              className="flex items-center gap-3 w-full text-right"
            >
              {session?.user?.image ? (
                <img src={session.user.image} alt="" className="w-11 h-11 rounded-full object-cover border border-[#EAEAEA]" />
              ) : (
                <span className="w-11 h-11 rounded-full bg-[#EAEAEA] flex items-center justify-center text-[#707070]">
                  <User className="w-5 h-5" />
                </span>
              )}
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-[#111111]">
                  {session?.user?.name || "تسجيل الدخول"}
                </span>
                {session?.user?.email && <span className="text-xs text-[#707070]">{session.user.email}</span>}
              </span>
            </button>

            {/* Language */}
            <div className="flex items-center gap-2 flex-wrap">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-300 ${
                    language === lang.code ? "bg-[#111111] text-white" : "bg-[#EAEAEA] text-[#2F2F2F] hover:bg-[#dedede]"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Country + logout */}
            <div className="flex items-center justify-between text-xs text-[#707070]">
              <span>تركيا</span>
              {session && (
                <button onClick={() => signOut()} className="font-semibold text-[#2F2F2F] hover:text-[#111111] transition-colors">
                  تسجيل الخروج
                </button>
              )}
            </div>
          </motion.div>

          {/* "Coming soon" toast for not-yet-built items */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute left-1/2 -translate-x-1/2 bottom-28 px-4 py-2 rounded-full bg-[#111111] text-white text-sm font-medium shadow-lg"
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
