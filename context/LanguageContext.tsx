"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";

export type Language = "en" | "ar" | "tr" | "de";

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
    tr: string;
    de: string;
  };
}

export const translations: Translations = {
  // Common
  "common.ok": {
    en: "OK",
    ar: "موافق",
    tr: "Tamam",
    de: "Akzeptieren",
  },
  
  // Scroll Sections (iPhone 17 Pro Specs)
  "scroll.scene1": {
    en: "iPhone 17 Pro",
    ar: "ايفون 17 برو",
    tr: "iPhone 17 Pro",
    de: "iPhone 17 Pro",
  },
  "scroll.scene2": {
    en: "A19 Pro Chip",
    ar: "شريحة A19 Pro",
    tr: "A19 Pro Çip",
    de: "A19 Pro Chip",
  },
  "scroll.scene3": {
    en: "48MP Camera",
    ar: "كاميرا 48MP",
    tr: "48MP Kamera",
    de: "48MP Kamera",
  },
  "scroll.scene4": {
    en: "Titanium Body",
    ar: "هيكل تيتانيوم",
    tr: "Titanyum Gövde",
    de: "Titan-Gehäuse",
  },
  "scroll.browse": {
    en: "Browse Now",
    ar: "تصفح الآن",
    tr: "Hemen İncele",
    de: "Jetzt durchsuchen",
  },

  // Navbar
  "nav.favorites": {
    en: "Featured Devices",
    ar: "الأجهزة المميزة",
    tr: "Öne Çıkan Cihazlar",
    de: "Ausgewählte Geräte",
  },
  "nav.details": {
    en: "Services & Specs",
    ar: "خدماتنا والمواصفات",
    tr: "Hizmetler & Özellikler",
    de: "Services & Specs",
  },
  "nav.contact": {
    en: "Visit Shop",
    ar: "فروعنا والتواصل",
    tr: "Mağazamızı Ziyaret Edin",
    de: "Besuchen Sie uns",
  },
  "nav.order": {
    en: "Buy Now",
    ar: "شراء الآن",
    tr: "Hemen Satın Al",
    de: "Jetzt Kaufen",
  },

  // Hero Section
  "hero.badge": {
    en: "Next-Gen Mobile & Tech Hub",
    ar: "مركز الهواتف والتكنولوجيا الحديثة",
    tr: "Yeni Nesil Mobil & Teknoloji Merkezi",
    de: "Next-Gen Mobil & Tech Hub",
  },
  "hero.title1": {
    en: "SMART",
    ar: "أحدث",
    tr: "AKILLI",
    de: "SMARTE",
  },
  "hero.title2": {
    "en": "DEVICES",
    "ar": "الأجهزة",
    "tr": "CİHAZLAR",
    "de": "GERÄTE",
  },
  "hero.desc": {
    en: "Sultan Mobile offers top-tier smartphones, premium accessories, instant credit top-ups, and certified pre-owned devices with glowing reliability.",
    ar: "يوفر محل سلطان أحدث الهواتف الذكية، إكسسوارات فاخرة، شحن رصيد فوري، وأجهزة مستعملة ومضمونة بأعلى معايير الجودة المريحة.",
    tr: "Sultan Mobil, en yeni akıllı telefonlar, premium aksesuarlar, anında bakiye yükleme ve garantili ikinci el cihazlar sunar.",
    de: "Sultan Mobile bietet neueste Smartphones, Premium-Zubehör, sofortiges Guthaben-Aufladen und geprüfte Gebrauchtgeräte.",
  },
  "hero.explore": {
    en: "Explore Devices",
    ar: "تصفح الأجهزة",
    tr: "Cihazları İncele",
    de: "Geräte erkunden",
  },

  // Crowd Favorites
  "fav.badge": {
    en: "Best Sellers",
    ar: "الأكثر طلباً ومبيعاً",
    tr: "Çok Satanlar",
    de: "Bestseller",
  },
  "fav.title": {
    en: "FEATURED DEVICES & ACCESSORIES",
    ar: "أحدث الأجهزة والإكسسوارات",
    tr: "ÖNE ÇIKAN CİHAZLAR VE AKSESUARLAR",
    de: "AUSGEWÄHLTE GERÄTE & ZUBEHÖR",
  },
  "fav.desc": {
    en: "Discover top-tier smartphones, gaming gear, and instant recharge cards with unbeatable warranty.",
    ar: "اكتشف تشكيلتنا الواسعة من الهواتف الذكية، إكسسوارات القيمنق، وبطاقات شحن الرصيد الفورية بضمان كامل.",
    tr: "Akıllı telefonlar, oyuncu ekipmanları ve anında bakiye kartlarını eşsiz garantiyle keşfedin.",
    de: "Entdecken Sie Smartphones, Gaming-Ausrüstung und Guthabenkarten mit unschlagbarer Garantie.",
  },

  // Product Details
  "prod.badge": {
    en: "Why Choose Us",
    ar: "لماذا تختار متجرنا",
    tr: "Neden Biz?",
    de: "Warum Uns Wählen",
  },
  "prod.title": {
    en: "SERVICES & TECH SPECIFICATIONS",
    ar: "خدماتنا ومواصفات الأجهزة",
    tr: "HİZMETLER & TEKNİK ÖZELLİKLER",
    de: "SERVICES & SPEZIFIKATIONEN",
  },
  "prod.desc": {
    en: "We provide certified devices, instant balance refills, and high-performance mobile accessories.",
    ar: "نقدم أجهزة أصلية معتمدة، تعبئة رصيد فورية لجميع الشبكات، وإكسسوارات متطورة ومضمونة.",
    tr: "Sertifikalı cihazlar, anında bakiye yükleme ve yüksek performanslı mobil aksesuarlar sunuyoruz.",
    de: "Wir bieten zertifizierte Geräte, sofortiges Aufladen und leistungsstarkes Mobilzubehör.",
  },

  // Contact Us
  "contact.badge": {
    en: "Store Support",
    ar: "دعم المتجر",
    tr: "Mağaza Destek",
    de: "Shop-Support",
  },
  "contact.title": {
    en: "CONNECT WITH SULTAN MOBILE",
    ar: "تواصل مع متجر سلطان للهواتف",
    tr: "SULTAN MOBİL İLE İLETİŞİME GEÇİN",
    de: "VERBINDEN SIE SICH MIT SULTAN MOBILE",
  },
  "contact.desc": {
    en: "Need a credit top-up, looking for a specific used device, or inquiring about accessories? Drop us a transmission.",
    ar: "هل تريد تعبئة رصيد، أو تبحث عن جهاز مستعمل بمواصفات معينة، أو تستفسر عن إكسسوار؟ تواصل معنا الآن.",
    tr: "Bakiye yüklemek mi istiyorsunuz, ikinci el cihaz mı arıyorsunuz? Bizimle iletişime geçin.",
    de: "Benötigen Sie Guthaben oder suchen Sie ein gebrauchtes Gerät? Schreiben Sie uns.",
  },

  // Hero Metrics
  "hero.m1.label": {
    en: "Original Warranty",
    ar: "أصلي ومضمون 100%",
    tr: "%100 Orijinal Garanti",
    de: "100% Original-Garantie",
  },
  "hero.m2.label": {
    en: "Customer Trust",
    ar: "ثقة الزبائن",
    tr: "Müşteri Güveni",
    de: "Kundenvertrauen",
  },
  "hero.m3.label": {
    en: "Instant Top-Up",
    ar: "شحن رصيد فوري",
    tr: "Anında Bakiye",
    de: "Sofortiges Aufladen",
  },
  "hero.m4.label": {
    en: "New & Used Phones",
    ar: "أجهزة جديدة ومستعملة",
    tr: "Sıfır & İkinci El",
    de: "Neu & Gebraucht",
  },

  // Product Details Features & Banner
  "prod.f1.title": {
    en: "Instant Credit Top-Up",
    ar: "تعبئة رصيد فورية",
    tr: "Anında Bakiye Yükleme",
    de: "Sofortige Guthabenaufladung",
  },
  "prod.f1.desc": {
    en: "Recharge your prepaid balance or pay internet bills instantly with our high-speed digital transmission network.",
    ar: "اشحن رصيد هاتفك أو ادفع فواتير الإنترنت فوراً وبثوانٍ معدودة عبر شبكتنا الرقمية المعتمدة لجميع الاتصالات.",
    tr: "Hazır kart bakiyenizi yükleyin veya faturalarınızı yüksek hızlı ağımızla anında ödeyin.",
    de: "Laden Sie Ihr Guthaben sofort auf oder bezahlen Sie Rechnungen in Sekundenschnelle.",
  },
  "prod.f2.title": {
    en: "Glowing Accessories",
    ar: "إكسسوارات نيون وشواحن",
    tr: "Neon Aksesuarlar",
    de: "Neon-Zubehör",
  },
  "prod.f2.desc": {
    en: "Cyberpunk LED cases, ultra-fast GAN chargers, wireless earbuds, and braided cables built to last.",
    ar: "كفرات مضيئة بأسلوب السايبربانك، شواحن فائقة السرعة، سماعات لاسلكية، وكابلات متينة تدوم طويلاً.",
    tr: "Cyberpunk LED kılıflar, ultra hızlı şarj cihazları ve dayanıklı kablosuz kulaklıklar.",
    de: "Cyberpunk LED-Hüllen, superschnelle Ladegeräte und langlebige kabellose Kopfhörer.",
  },
  "prod.f3.title": {
    en: "Certified Pre-Owned",
    ar: "أجهزة مستعملة ومفحوصة",
    tr: "Garantili İkinci El",
    de: "Geprüfte Gebrauchtgeräte",
  },
  "prod.f3.desc": {
    en: "Every used smartphone undergoes a rigorous 50-point diagnostic inspection and comes with a solid shop warranty.",
    ar: "يخضع كل هاتف مستعمل لفحص دقيق وشامل لأكثر من 50 نقطة أداء لضمان كفاءة البطارية والشاشة مع ضمان المحل.",
    tr: "Her ikinci el telefon 50 noktalı detaylı testten geçer ve mağaza garantisiyle sunulur.",
    de: "Jedes gebrauchte Smartphone durchläuft eine 50-Punkte-Prüfung und hat Garantie.",
  },
  "prod.f4.title": {
    en: "Latest Flagship Devices",
    ar: "أحدث الأجهزة الجديدة",
    tr: "En Yeni Amiral Gemisi Cihazlar",
    de: "Neueste Flaggschiff-Geräte",
  },
  "prod.f4.desc": {
    en: "Get the newest releases from Apple, Samsung, and Xiaomi at competitive prices right upon global launch.",
    ar: "احصل على أحدث إصدارات الهواتف العالمية فور نزولها بالأسواق بأسعار منافسة وضمان الوكيل الرسمي.",
    tr: "Apple, Samsung ve Xiaomi'nin en yeni modellerini rekabetçi fiyatlarla hemen alın.",
    de: "Holen Sie sich die neuesten Modelle von Apple, Samsung ve Xiaomi zu besten Preisen.",
  },
  "prod.banner.title": {
    en: "Looking for a specific device or accessory?",
    ar: "هل تبحث عن جهاز مستعمل معين أو قطعة نادرة؟",
    tr: "Özel bir cihaz veya aksesuar mı arıyorsunuz?",
    de: "Suchen Sie ein bestimmtes Gerät oder Zubehör?",
  },
  "prod.banner.desc": {
    en: "Tell us your required specs and budget, and our experts will source the perfect phone or recharge deal for you.",
    ar: "أخبرنا بالمواصفات والميزانية المطلوبة وسيقوم فريقنا بتوفير الهاتف أو الإكسسوار الأنسب لك فوراً.",
    tr: "Bütçenizi ve istediğiniz özellikleri söyleyin, uzmanlarımız sizin için en uygun cihazı bulsun.",
    de: "Teilen Sie uns Ihr Budget mit, unsere Experten finden das perfekte Gerät für Sie.",
  },
  "prod.banner.btn": {
    en: "Request Device Inquiry",
    ar: "اطلب استفسار عن جهاز",
    tr: "Cihaz Sorgulama Talep Et",
    de: "Geräteanfrage senden",
  },
  
  // Profile
  "nav.profile": {
    en: "My Profile",
    ar: "ملفي الشخصي",
    tr: "Profilim",
    de: "Mein Profil",
  },
  "nav.login": {
    en: "Sign in with Google",
    ar: "تسجيل الدخول بجوجل",
    tr: "Google ile Giriş Yap",
    de: "Mit Google anmelden",
  },
  "profile.title": {
    en: "User Profile",
    ar: "الملف الشخصي",
    tr: "Kullanıcı Profili",
    de: "Benutzerprofil",
  },
  "profile.logout": {
    en: "Sign Out",
    ar: "تسجيل الخروج",
    tr: "Çıkış Yap",
    de: "Abmelden",
  },
  "profile.welcome": {
    en: "Welcome back",
    ar: "أهلاً بك",
    tr: "Hoş Geldiniz",
    de: "Willkommen zurück",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = React.createContext<LanguageContextType>({
  language: "ar",
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = React.useState<Language>("ar");
  const [dynamicTranslations, setDynamicTranslations] = React.useState<Translations>(translations);

  React.useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  React.useEffect(() => {
    // Attempt to fetch from Firebase
    let unsubscribe: () => void;
    try {
      unsubscribe = onSnapshot(collection(db, "translations"), (querySnapshot) => {
        if (!querySnapshot.empty) {
          const fetchedTranslations: Translations = { ...translations };
          querySnapshot.forEach((doc) => {
            fetchedTranslations[doc.id] = doc.data() as any;
          });
          setDynamicTranslations(fetchedTranslations);
        }
      }, (err) => {
        console.warn("Could not fetch translations from Firebase, using fallback.", err);
      });
    } catch (err) {
      console.warn("Could not setup translations listener.", err);
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const t = React.useCallback(
    (key: string) => {
      if (dynamicTranslations[key] && dynamicTranslations[key][language]) {
        return dynamicTranslations[key][language];
      }
      return key; // fallback to key
    },
    [language, dynamicTranslations]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className={language === "ar" ? "font-sans text-right" : "font-sans text-left"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => React.useContext(LanguageContext);
