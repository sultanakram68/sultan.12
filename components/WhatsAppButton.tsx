"use client";

import * as React from "react";

import { useSettings } from "@/hooks/useSettings";
import { WhatsAppIcon } from "./WhatsAppIcon";

/**
 * Floating WhatsApp Chat Button Component
 * Monochrome: black core, soft white glow ring
 */
export function WhatsAppButton() {
  const { settings } = useSettings();
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`;

  return (
    <div className="hidden md:flex fixed bottom-6 right-6 z-50 items-center justify-center group">
      {/* Soft ring glow */}
      <div className="absolute -inset-1 rounded-full bg-black/10 blur-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Main Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative z-10 w-14 h-14 flex items-center justify-center hover:scale-105 transition-transform duration-300 p-3 bg-black border border-black/20 rounded-full shadow-lg"
      >
        <WhatsAppIcon className="relative z-10 w-full h-full text-white transition-transform duration-300 group-hover:scale-105" />
      </a>
    </div>
  );
}
