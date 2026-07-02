"use client";

import * as React from "react";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Contact Us Section Component
 */
export function ContactUs() {
  const [submitted, setSubmitted] = React.useState(false);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="contact-us" className="py-20 bg-neon-dark relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Info Side */}
          <div>
            <div className="inline-flex items-center gap-2 text-neon-green text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-neon-green/30 bg-neon-green/5 mb-4">
              {t("contact.badge")}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
              {t("contact.title")}
            </h2>
            <p className="text-gray-400 text-base sm:text-lg mb-8 leading-relaxed">
              {t("contact.desc")}
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-neon-surface border border-neon-border text-neon-green shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold">Shop Location / الموقع</h4>
                  <p className="text-gray-300 text-base font-medium mt-1">عثمانية مركز - Osmaniye Merkez</p>
                </div>
              </div>

              <a href="tel:+905377903339" className="flex items-start gap-4 group cursor-pointer p-2 -m-2 rounded-xl hover:bg-neon-surface/40 transition-all">
                <div className="p-3 rounded-xl bg-neon-surface border border-neon-border text-neon-green shrink-0 group-hover:bg-neon-green group-hover:text-neon-dark transition-all duration-300 shadow-[0_0_10px_rgba(255,103,0,0.2)]">
                  <Phone className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-white font-bold group-hover:text-neon-green transition-colors">Direct Line / Call Now</h4>
                  <p className="text-[#ff6700] font-mono font-bold text-base mt-1 tracking-wider">+90 537 790 33 39</p>
                </div>
              </a>

              <a href="mailto:abdullah@sultan.com" className="flex items-start gap-4 group cursor-pointer p-2 -m-2 rounded-xl hover:bg-neon-surface/40 transition-all">
                <div className="p-3 rounded-xl bg-neon-surface border border-neon-border text-neon-green shrink-0 group-hover:bg-neon-green group-hover:text-neon-dark transition-all duration-300 shadow-[0_0_10px_rgba(255,103,0,0.2)]">
                  <Mail className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-white font-bold group-hover:text-neon-green transition-colors">Electronic Mail / البريد</h4>
                  <p className="text-gray-300 font-mono text-sm mt-1 underline underline-offset-4 decoration-neon-green/40 group-hover:text-[#ff6700]">abdullah@sultan.com</p>
                </div>
              </a>
            </div>
          </div>

          {/* Form Side */}
          <Card className="p-8 sm:p-10 bg-neon-surface/60 border-neon-border shadow-2xl relative overflow-hidden">
            <h3 className="text-2xl font-bold text-white mb-6">Send a Transmission</h3>
            
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-neon-green/20 border-2 border-neon-green text-neon-green flex items-center justify-center mx-auto shadow-neon-glow animate-pulse">
                  <Send className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white">Message Transmitted!</h4>
                <p className="text-gray-400 text-sm">Our concierge will contact you within 2 virtual hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    className="w-full px-4 py-3 rounded-xl bg-neon-dark border border-neon-border text-white placeholder-gray-600 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@cybernet.com"
                    className="w-full px-4 py-3 rounded-xl bg-neon-dark border border-neon-border text-white placeholder-gray-600 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your event or inquiry..."
                    className="w-full px-4 py-3 rounded-xl bg-neon-dark border border-neon-border text-white placeholder-gray-600 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all resize-none"
                  ></textarea>
                </div>

                <Button type="submit" variant="neon" size="lg" className="w-full gap-2 font-bold">
                  <span>Transmit Message</span>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            )}
          </Card>

        </div>

      </div>
    </section>
  );
}
