"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

export default function MediaAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  // Default values
  const [whatsapp, setWhatsapp] = useState("905377903339");
  const [marquee, setMarquee] = useState([
    "شحن رصيد ودفع فواتير فوري لكافة الشبكات",
    "كفالة وضمان حقيقي 100% على كافة الأجهزة",
    "خصم 50% على الإكسسوارات والسماعات الأصلية",
    "صيانة فورية خلال 30 دقيقة فقط"
  ]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.whatsappNumber) setWhatsapp(data.whatsappNumber);
          if (data.marqueeTexts && Array.isArray(data.marqueeTexts)) setMarquee(data.marqueeTexts);
        }
      } catch (error) {
        console.error("Error fetching settings", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    
    try {
      await setDoc(doc(db, "settings", "general"), {
        whatsappNumber: whatsapp,
        marqueeTexts: marquee
      }, { merge: true });
      
      setMessage("Settings saved successfully! Changes are now live.");
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error("Error saving settings", error);
      setMessage("Error saving settings. Please try again.");
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

  if (loading) return <div className="text-blue-600 font-semibold p-8">جاري تحميل الإعدادات...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">الإعدادات العامة والوسائط</h1>
          <p className="text-gray-500">إدارة إعدادات الموقع، معلومات التواصل، والنصوص المتحركة.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          {saving ? "جاري الحفظ..." : "حفظ كل الإعدادات"}
        </button>
      </div>

      {message && (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-6 border border-blue-100 font-medium">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Contact Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </span>
            معلومات التواصل
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">رقم الواتساب</label>
              <p className="text-xs text-gray-400 mb-2">أدخل الرقم مع رمز الدولة وبدون علامة + أو مسافات (مثال: 905301234567)</p>
              <input 
                type="text" 
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-left"
                placeholder="905XXXXXXXXX"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Marquee Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
            </span>
            النصوص المتحركة
          </h3>
          <p className="text-xs text-gray-400 mb-4">هذه النصوص ستظهر في الشريط المتحرك أعلى الصفحة الرئيسية.</p>
          
          <div className="space-y-3">
            {marquee.map((text, idx) => (
              <div key={idx} className="flex gap-2">
                <input 
                  type="text" 
                  value={text}
                  onChange={e => updateMarqueeText(idx, e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder={`النص المتحرك ${idx + 1}`}
                />
                <button 
                  onClick={() => removeMarqueeText(idx)}
                  className="px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100 shadow-sm"
                  title="حذف"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            ))}
            
            <button 
              onClick={addMarqueeText}
              className="mt-2 w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg font-semibold hover:border-blue-400 hover:text-blue-600 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              إضافة نص متحرك
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
