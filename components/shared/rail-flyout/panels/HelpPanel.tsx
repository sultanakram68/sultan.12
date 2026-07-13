"use client";

import { MessageCircle, Instagram, Facebook, MapPin, type LucideIcon } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

/** Flyout panel: support & contact channels, sourced live from store settings. */
export default function HelpPanel() {
  const { settings } = useSettings();
  const wa = `https://wa.me/${(settings.whatsappNumber || "").replace(/[^0-9]/g, "")}`;

  const links: { label: string; href: string; icon: LucideIcon }[] = [
    { label: "تواصل عبر واتساب", href: wa, icon: MessageCircle },
    ...(settings.instagramUrl ? [{ label: "Instagram", href: settings.instagramUrl, icon: Instagram }] : []),
    ...(settings.facebookUrl ? [{ label: "Facebook", href: settings.facebookUrl, icon: Facebook }] : []),
    ...(settings.mapsUrl ? [{ label: "الموقع على الخريطة", href: settings.mapsUrl, icon: MapPin }] : []),
  ];

  return (
    <div>
      <h2 id="flyout-panel-title" className="text-white text-lg font-semibold mb-4">المساعدة والدعم</h2>
      <div className="space-y-1">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#8A8A8A] hover:text-white hover:bg-white/[0.04] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <Icon size={16} />
              <span>{l.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
