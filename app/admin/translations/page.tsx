"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { translations as defaultTranslations } from "@/context/LanguageContext";

export default function TranslationsAdmin() {
  const [translations, setTranslations] = useState<any>({});
  const [savedTranslations, setSavedTranslations] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
      } finally {
        setLoading(false);
      }
    };
    fetchTranslations();
  }, []);

  const handleSave = async (key: string) => {
    setSaving(true);
    setMessage("");
    try {
      await setDoc(doc(db, "translations", key), translations[key]);
      setSavedTranslations(prev => ({ ...prev, [key]: translations[key] }));
      setMessage(`تم حفظ ${key} بنجاح!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving", error);
      setMessage("حدث خطأ أثناء حفظ النص");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage("");
    try {
      for (const key of Object.keys(translations)) {
        await setDoc(doc(db, "translations", key), translations[key]);
      }
      setSavedTranslations(translations);
      setMessage("تم حفظ جميع النصوص بنجاح!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving all", error);
      setMessage("حدث خطأ أثناء حفظ بعض النصوص");
    } finally {
      setSaving(false);
    }
  };

  // Filter keys based on SAVED translations so it doesn't disappear while typing
  const filteredKeys = Object.keys(savedTranslations).filter((key) => {
    const query = searchQuery.toLowerCase();
    if (key.toLowerCase().includes(query)) return true;
    
    const langs = savedTranslations[key];
    for (const langValue of Object.values(langs)) {
      if (typeof langValue === 'string' && langValue.toLowerCase().includes(query)) return true;
    }
    return false;
  });

  if (loading) return <div className="text-blue-600 font-semibold p-8">جاري تحميل النصوص...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">إدارة نصوص الموقع</h1>
          <p className="text-gray-500">تعديل جميع الكلمات والنصوص الموجودة في الموقع بجميع اللغات.</p>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          {saving ? "جاري الحفظ..." : "حفظ الكل"}
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input 
            type="text" 
            placeholder="ابحث عن نص بالعربية، الإنجليزية، أو المفتاح..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg p-3 pr-11 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {message && (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-6 border border-blue-100 font-medium">
          {message}
        </div>
      )}

      <div className="space-y-6">
        {filteredKeys.map((key) => {
          const langs = translations[key];
          return (
            <div key={key} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200 inline-block">مفتاح: <span className="font-mono text-blue-600">{key}</span></h3>
                <button 
                  onClick={() => handleSave(key)}
                  className="text-sm bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors border border-gray-200 font-semibold shadow-sm"
                >
                  حفظ هذا السطر
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {["en", "ar", "tr", "de"].map((lang) => (
                  <div key={lang}>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-100 block border border-blue-200"></span>
                      {lang === 'ar' ? 'العربية' : lang === 'en' ? 'الإنجليزية' : lang === 'tr' ? 'التركية' : 'الألمانية'}
                    </label>
                    <textarea
                      value={langs[lang] || ""}
                      onChange={(e) => setTranslations({
                        ...translations,
                        [key]: { ...langs, [lang]: e.target.value }
                      })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all min-h-[90px] resize-y"
                      dir={lang === 'ar' ? 'rtl' : 'ltr'}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {filteredKeys.length === 0 && !loading && (
          <div className="py-16 text-center text-gray-600 bg-white border-2 border-dashed border-gray-300 rounded-xl">
            <p className="font-bold text-lg">لم يتم العثور على نصوص مطابقة للبحث.</p>
          </div>
        )}
      </div>
    </div>
  );
}
