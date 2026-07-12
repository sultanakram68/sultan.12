"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Save, CheckCircle2, AlertTriangle, Phone, Type, Plus, X, Settings2, Instagram, Facebook, MapPin } from "lucide-react";

export default function MediaAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Default values
  const [whatsapp, setWhatsapp] = useState("905377903339");
  const [marquee, setMarquee] = useState([
    "شحن رصيد ودفع فواتير فوري لكافة الشبكات",
    "كفالة وضمان حقيقي 100% على كافة الأجهزة",
    "خصم 50% على الإكسسوارات والسماعات الأصلية",
    "صيانة فورية خلال 30 دقيقة فقط"
  ]);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");

  // Toast State
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'success'});

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.whatsappNumber) setWhatsapp(data.whatsappNumber);
          if (data.marqueeTexts && Array.isArray(data.marqueeTexts)) setMarquee(data.marqueeTexts);
          if (data.instagramUrl) setInstagramUrl(data.instagramUrl);
          if (data.facebookUrl) setFacebookUrl(data.facebookUrl);
          if (data.mapsUrl) setMapsUrl(data.mapsUrl);
        }
      } catch (error) {
        console.error("Error fetching settings", error);
        showToast("فشل جلب الإعدادات", "error");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await setDoc(doc(db, "settings", "general"), {
        whatsappNumber: whatsapp,
        marqueeTexts: marquee.filter(text => text.trim() !== ""),
        instagramUrl: instagramUrl.trim(),
        facebookUrl: facebookUrl.trim(),
        mapsUrl: mapsUrl.trim()
      }, { merge: true });
      
      showToast("تم حفظ الإعدادات بنجاح!");
    } catch (error) {
      console.error("Error saving settings", error);
      showToast("حدث خطأ أثناء حفظ الإعدادات", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateMarqueeText = (index: number, value: string) => {
    const newMarquee = [...marquee];
    newMarquee[index] = value;
    setMarquee(newMarquee);
  };

  const addMarqueeText = () => {
    setMarquee([...marquee, ""]);
  };

  const removeMarqueeText = (index: number) => {
    setMarquee(marquee.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Notification (Vercel Style) */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
            <span className="font-medium text-sm text-zinc-100">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/50 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight mb-1">إعدادات الوسائط والنظام</h1>
          <p className="text-zinc-500 text-sm">تخصيص أرقام التواصل والنصوص المتحركة (Marquee) الظاهرة في الموقع.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-1.5 rounded-md text-sm font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            <Save size={16} />
            {saving ? "جاري الحفظ..." : "حفظ كل الإعدادات"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* WhatsApp Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5 h-fit"
          >
            <div className="flex items-center gap-3 mb-5 border-b border-zinc-800/50 pb-4">
              <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shadow-sm">
                <Phone size={16} />
              </div>
              <h2 className="text-sm font-bold text-zinc-200">رقم الواتساب</h2>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400">رقم الهاتف (مع رمز الدولة)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">+</span>
                <input 
                  type="text" 
                  value={whatsapp} 
                  onChange={(e) => setWhatsapp(e.target.value)} 
                  dir="ltr"
                  placeholder="90537..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-8 pr-3 py-2 text-zinc-200 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors font-mono text-sm shadow-inner"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">سيتم استخدام هذا الرقم في زر &quot;تواصل معنا&quot; العائم لتوجيه العملاء مباشرة إليك.</p>
            </div>
          </motion.div>

          {/* Marquee Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-5 border-b border-zinc-800/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shadow-sm">
                  <Type size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-200">الشريط الإخباري (Marquee)</h2>
                  <p className="text-[11px] text-zinc-500">النصوص المتحركة في أعلى الموقع</p>
                </div>
              </div>
              <button 
                onClick={addMarqueeText}
                className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border border-zinc-700"
              >
                <Plus size={14} /> إضافة نص
              </button>
            </div>
            
            <div className="space-y-3">
              <AnimatePresence>
                {marquee.map((text, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2"
                  >
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={text} 
                        onChange={(e) => updateMarqueeText(index, e.target.value)} 
                        placeholder={`النص رقم ${index + 1}`}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-zinc-200 text-sm focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors shadow-inner"
                      />
                    </div>
                    <button 
                      onClick={() => removeMarqueeText(index)}
                      className="w-10 flex items-center justify-center bg-zinc-900 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 border border-zinc-800 rounded-md transition-colors shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {marquee.length === 0 && (
                <div className="text-center py-10 border border-dashed border-zinc-700 rounded-lg">
                  <Settings2 className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">لا يوجد نصوص حالياً. انقر على إضافة نص للبدء.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Social & Location Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3 bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-5 border-b border-zinc-800/50 pb-4">
              <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shadow-sm">
                <MapPin size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-200">روابط التواصل والموقع</h2>
                <p className="text-[11px] text-zinc-500">تظهر هذه الروابط في قائمة الموقع (اتركها فارغة لإخفائها)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                  <Instagram size={13} /> إنستغرام
                </label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  dir="ltr"
                  placeholder="https://instagram.com/..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-zinc-200 text-sm focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                  <Facebook size={13} /> فيسبوك
                </label>
                <input
                  type="text"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  dir="ltr"
                  placeholder="https://facebook.com/..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-zinc-200 text-sm focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                  <MapPin size={13} /> موقع المحل (Google Maps)
                </label>
                <input
                  type="text"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  dir="ltr"
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-zinc-200 text-sm focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors shadow-inner"
                />
              </div>
            </div>
          </motion.div>

        </div>
    </div>
  );
}
