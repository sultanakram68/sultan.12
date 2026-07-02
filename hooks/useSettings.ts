"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

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
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            whatsappNumber: data.whatsappNumber || defaultSettings.whatsappNumber,
            marqueeTexts: (data.marqueeTexts && Array.isArray(data.marqueeTexts)) ? data.marqueeTexts : defaultSettings.marqueeTexts
          });
        }
      } catch (error) {
        console.error("Error fetching settings", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  return { settings, loading };
}
