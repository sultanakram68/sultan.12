"use client";

import React from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Smartphone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { MenuItem } from "./CrowdFavorites";
import { ProductCard } from "./ProductCard";

interface CrowdFavoritesClientProps {
  favorites: MenuItem[];
}

export function CrowdFavoritesClient({ favorites }: CrowdFavoritesClientProps) {
  const { t } = useLanguage();
  const [items, setItems] = React.useState<MenuItem[]>(favorites);

  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snap) => {
      if (!snap.empty) {
        const fetched: MenuItem[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          fetched.push({
            _id: doc.id,
            name: data.name,
            slug: doc.id,
            price: data.price || 0,
            originalPrice: data.originalPrice || undefined,
            description: data.description,
            imageUrl: data.imageUrl,
          });
        });
        setItems(fetched);
      } else {
        setItems([]);
      }
    }, (err) => {
      console.warn("Could not fetch products from Firebase, using fallback.", err);
    });

    return () => unsubscribe();
  }, [favorites]);

  return (
    <section id="crowd-favorites" className="py-20 bg-limixi-bg relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#342E37]/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-limixi-dark text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-[#342E37]/15 bg-[#342E37]/[0.03] mb-3">
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t("fav.badge")}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-limixi-dark tracking-tight">
              {t("fav.title")}
            </h2>
            <p className="text-[#342E37]/70 mt-3 max-w-2xl text-base sm:text-lg">
              {t("fav.desc")}
            </p>
          </div>
        </div>

        {/* Product Grid / Real Empty State */}
        {items.length === 0 ? (
          <div className="text-center py-16 bg-[#342E37]/[0.02] rounded-2xl border border-[#342E37]/10">
            <p className="text-[#342E37]/70 text-lg font-medium">لم يتم إضافة منتجات في المتجر بعد - سيتم تحديث القائمة قريباً...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {items.map((item) => (
              <ProductCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
