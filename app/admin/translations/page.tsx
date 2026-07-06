"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { translations as defaultTranslations } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Save, CheckCircle2, AlertTriangle, Globe } from "lucide-react";

export default function TranslationsAdmin() {
  const [translations, setTranslations] = useState<any>({});
  const [savedTranslations, setSavedTranslations] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Toast State
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'success'});

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const snap = await getDocs(collection(db, "translations"));
        if (snap.empty) {
          setTranslations(defaultTranslations);
          setSavedTranslations(defaultTranslations);
        } else {
          const fetched: any = {};
          snap.forEach((doc) => {
            fetched[doc.id] = doc.data();
          });
          const merged = { ...defaultTranslations, ...fetched };
          setTranslations(merged);
          setSavedTranslations(merged);
        }
      } catch (error) {
        console.error("Error fetching translations", error);
        setTranslations(defaultTranslations);
        setSavedTranslations(defaultTranslations);
        showToast("فشل جلب النصوص", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchTranslations();
  }, []);

  const handleSave = async (key: string) => {
    setSavingKey(key);
    try {
      await setDoc(doc(db, "translations", key), translations[key]);
      setSavedTranslations((prev: any) => ({ ...prev, [key]: translations[key] }));
      showToast(`تم حفظ النص بنجاح!`);
    } catch (error: any) {
      console.error("Error saving", error);
      alert("خطأ فايربيس: " + (error.message || JSON.stringify(error)));
      showToast("حدث خطأ أثناء الحفظ", "error");
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveAll = async () => {
    setIsSavingAll(true);
    try {
      const promises = Object.keys(translations).map((key) =>
        setDoc(doc(db, "translations", key), translations[key])
      );
      await Promise.all(promises);
      setSavedTranslations(translations);
      showToast("تم حفظ جميع النصوص بنجاح!");
    } catch (error) {
      console.error("Error saving all", error);
      showToast("حدث خطأ أثناء الحفظ الشامل", "error");
    } finally {
      setIsSavingAll(false);
    }
  };

  const filteredKeys = Object.keys(savedTranslations).filter((key) => {
    const query = searchQuery.toLowerCase();
    if (key.toLowerCase().includes(query)) return true;
    const langs = savedTranslations[key];
    for (const langValue of Object.values(langs)) {
      if (typeof langValue === 'string' && langValue.toLowerCase().includes(query)) return true;
    }
    return false;
  });

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Notification */}
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
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight mb-1">نصوص الموقع</h1>
          <p className="text-zinc-500 text-sm">إدارة وتعديل جميع النصوص الظاهرة في الموقع الرسمي.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="البحث..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 bg-zinc-900/50 border border-zinc-800 rounded-md pr-9 pl-4 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={handleSaveAll}
            disabled={isSavingAll || loading}
            className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-1.5 rounded-md text-sm font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            <Save size={16} />
            {isSavingAll ? "جاري الحفظ..." : "حفظ الكل"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredKeys.map((key) => {
            const isChanged = JSON.stringify(translations[key]) !== JSON.stringify(savedTranslations[key]);
            
            return (
              <motion.div 
                key={key} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-zinc-900/80 border rounded-xl p-5 transition-colors ${isChanged ? 'border-zinc-500 bg-zinc-900' : 'border-zinc-800/80'}`}
              >
                <div className="flex justify-between items-center mb-4 border-b border-zinc-800/50 pb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-zinc-600" />
                    <h3 className="font-semibold text-zinc-300 font-mono text-[11px]" dir="ltr">{key}</h3>
                  </div>
                  {isChanged && <span className="text-[10px] font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded-sm">غير محفوظ</span>}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Arabic (عربي)</label>
                    <textarea 
                      value={translations[key]?.ar || ""}
                      onChange={(e) => setTranslations({...translations, [key]: {...translations[key], ar: e.target.value}})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-200 text-sm focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors resize-none shadow-inner"
                      rows={2}
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">English (إنجليزي)</label>
                    <textarea 
                      value={translations[key]?.en || ""}
                      onChange={(e) => setTranslations({...translations, [key]: {...translations[key], en: e.target.value}})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-200 text-sm focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors font-mono resize-none shadow-inner"
                      rows={2}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => handleSave(key)}
                    disabled={savingKey === key || !isChanged}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      isChanged 
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700' 
                        : 'bg-zinc-900 text-zinc-600 border border-zinc-800/50 cursor-not-allowed'
                    }`}
                  >
                    <Save size={12} />
                    {savingKey === key ? "جاري الحفظ..." : "حفظ التعديل"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
    </div>
  );
}
