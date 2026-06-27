"use client";

import * as React from "react";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

/**
 * Contact Us Section Component
 * 
 * FOR STUDENTS:
 * This component satisfies the `#contact-us` navigation link.
 * We use React client state (`useState`) to handle basic form submission simulation.
 */
export function ContactUs() {
  const [submitted, setSubmitted] = React.useState(false);

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
              Get In Touch
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
              CONNECT WITH <span className="text-neon-green">NEON HQ</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg mb-8 leading-relaxed">
              Have questions about catering, dietary allergies, or booking our cyberpunk lounge for private shoots? Drop a transmission below.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-neon-surface border border-neon-border text-neon-green shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold">Lounge Location</h4>
                  <p className="text-gray-400 text-sm mt-1">1042 Cyber District Blvd, Sector 7, Neo Tokyo / Edessa Hub</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-neon-surface border border-neon-border text-neon-green shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold">Direct Line</h4>
                  <p className="text-gray-400 text-sm mt-1">+1 (800) NEON-BITE / 24 Hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-neon-surface border border-neon-border text-neon-green shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold">Electronic Mail</h4>
                  <p className="text-gray-400 text-sm mt-1">transmissions@neonbites.io</p>
                </div>
              </div>
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
