"use client";

import * as React from "react";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Contact Us Section Component (100% Real Firebase & WhatsApp Integration)
 */
export function ContactUs() {
  const [submitted, setSubmitted] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const { t } = useLanguage();
  const { settings } = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "messages"), {
        name,
        email,
        message,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error saving message:", err);
    }

    // إرسال الرسالة مباشرة إلى واتساب صاحب المتجر
    const phone = settings.whatsappNumber || "905377903339";
    const text = `رسالة جديدة من الموقع:\nالاسم: ${name}\nالبريد: ${email}\nالرسالة: ${message}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");

    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="contact-us" className="py-20 bg-white relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Info Side */}
          <div>
            <div className="inline-flex items-center gap-2 text-black/60 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-black/20 bg-black/[0.03] mb-4">
              {t("contact.badge")}
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-black tracking-tight mb-6">
              {t("contact.title")}
            </h2>
            <p className="text-gray-600 text-base sm:text-lg mb-8 leading-relaxed">
              {t("contact.desc")}
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-black/[0.03] border border-black/10 text-black shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-black font-bold">Shop Location / الموقع</h4>
                  <p className="text-gray-600 text-base font-medium mt-1">عثمانية مركز - Osmaniye Merkez</p>
                </div>
              </div>

              <a href={`tel:+${settings.whatsappNumber || "905377903339"}`} className="flex items-start gap-4 group cursor-pointer p-2 -m-2 rounded-xl hover:bg-black/[0.03] transition-all">
                <div className="p-3 rounded-xl bg-black/[0.03] border border-black/10 text-black shrink-0 group-hover:bg-black group-hover:text-white transition-all duration-300">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-black font-bold transition-colors">Direct Line / Call Now</h4>
                  <p className="text-gray-600 font-mono font-bold text-base mt-1 tracking-wider">+{settings.whatsappNumber || "90 537 790 33 39"}</p>
                </div>
              </a>

              <a href="mailto:abdullah@sultan.com" className="flex items-start gap-4 group cursor-pointer p-2 -m-2 rounded-xl hover:bg-black/[0.03] transition-all">
                <div className="p-3 rounded-xl bg-black/[0.03] border border-black/10 text-black shrink-0 group-hover:bg-black group-hover:text-white transition-all duration-300">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-black font-bold transition-colors">Electronic Mail / البريد</h4>
                  <p className="text-gray-600 font-mono text-sm mt-1 underline underline-offset-4 decoration-black/30 group-hover:text-black">abdullah@sultan.com</p>
                </div>
              </a>
            </div>
          </div>

          {/* Form Side */}
          <Card className="p-8 sm:p-10 bg-black/[0.02] border-black/10 shadow-xl relative overflow-hidden">
            <h3 className="text-2xl font-bold text-black mb-6">Send a Message</h3>

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-black/5 border-2 border-black text-black flex items-center justify-center mx-auto">
                  <Send className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-black">Message Sent!</h4>
                <p className="text-gray-600 text-sm">تم حفظ رسالتك وإرسالها عبر واتساب مباشرة لصاحب المتجر.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="الاسم الكريم"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-black/15 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-black/15 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب رسالتك أو استفسارك هنا..."
                    className="w-full px-4 py-3 rounded-xl bg-white border border-black/15 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none"
                  ></textarea>
                </div>

                <Button type="submit" size="lg" className="w-full gap-2 font-semibold bg-black text-white hover:bg-gray-800">
                  <span>إرسال الرسالة</span>
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
