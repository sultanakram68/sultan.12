"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

export interface Settings {
  whatsappNumber: string;
  marqueeTexts: string[];
}

const defaultSettings: Settings = {
  whatsappNumber: "905377903339",
  marqueeTexts: [
    "شحن رصيد ودفع فواتير فوري لكافة الشبكات",
    "كفالة وضمان حقيقي 100% على كافة الأجهزة",
    "خصم 50% على الإكسسوارات والسماعات الأصلية",
    "صيانة فورية خلال 30 دقيقة فقط"
  ]
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "settings", "general");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          whatsappNumber: data.whatsappNumber || defaultSettings.whatsappNumber,
          marqueeTexts: (data.marqueeTexts && Array.isArray(data.marqueeTexts)) ? data.marqueeTexts : defaultSettings.marqueeTexts
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to settings", error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  return { settings, loading };
}
