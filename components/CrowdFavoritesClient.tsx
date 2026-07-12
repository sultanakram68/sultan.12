"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Smartphone, ShoppingBag } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { MenuItem } from "./CrowdFavorites";

interface CrowdFavoritesClientProps {
  favorites: MenuItem[];
}

export function CrowdFavoritesClient({ favorites }: CrowdFavoritesClientProps) {
  const { t } = useLanguage();
  const { settings } = useSettings();
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
    <section id="crowd-favorites" className="py-20 bg-white relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-black/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-black text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-black/15 bg-black/[0.03] mb-3">
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t("fav.badge")}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-black tracking-tight">
              {t("fav.title")}
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl text-base sm:text-lg">
              {t("fav.desc")}
            </p>
          </div>
        </div>

        {/* Product Grid / Real Empty State */}
        {items.length === 0 ? (
          <div className="text-center py-16 bg-black/[0.02] rounded-2xl border border-black/10">
            <p className="text-gray-600 text-lg font-medium">لم يتم إضافة منتجات في المتجر بعد - سيتم تحديث القائمة قريباً...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {items.map((item) => {
              const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
              const originalPrice = item.originalPrice
                ? (typeof item.originalPrice === "string" ? parseFloat(item.originalPrice) : item.originalPrice)
                : undefined;
              const hasDiscount = !!originalPrice && originalPrice > price;
              const discountPct = hasDiscount ? Math.round((1 - price / originalPrice!) * 100) : 0;

              const orderHref = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`مرحباً، أرغب في شراء: ${item.name}`)}`;

              return (
            <Card key={item._id} className="flex flex-col justify-between bg-white border-black/10 hover:border-black/20 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300">
              <Link href={`/product/${item._id}`} className="block group-hover:opacity-95 transition-opacity">
                <div>
                  {/* Image Container */}
                  <div className="relative w-full aspect-square overflow-hidden bg-black/[0.03] rounded-t-3xl flex items-center justify-center p-2">
                    {hasDiscount && (
                      <span className="absolute top-3 left-3 z-10 bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                        −{discountPct}%
                      </span>
                    )}
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        No Image Available
                      </div>
                    )}

                    {/* Floating Circular Add Button (overlaps image bottom edge) */}
                    <a
                      href={orderHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={t("nav.order")}
                      className="absolute bottom-0 right-3 translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black text-white flex items-center justify-center shadow-lg border-4 border-white hover:scale-105 transition-transform duration-300"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Content */}
                  <CardHeader className="p-4 pt-6 pb-1 space-y-1">
                    <CardTitle className="text-black text-base font-bold line-clamp-1">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 pb-2">
                    <CardDescription className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                      {item.description || "Premium device guaranteed with full shop warranty."}
                    </CardDescription>
                  </CardContent>
                </div>
              </Link>

              {/* Action Footer */}
              <CardFooter className="p-4 pt-0 flex-col items-stretch gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-black font-extrabold text-xl">
                    {item.price}
                  </span>
                  {hasDiscount && (
                    <span className="text-gray-400 text-sm line-through">
                      {item.originalPrice}
                    </span>
                  )}
                </div>

                <a href={orderHref} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button size="sm" className="w-full gap-2 bg-black text-white hover:bg-black/85 transition-all font-semibold rounded-full cursor-pointer">
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t("nav.order")}</span>
                  </Button>
                </a>
              </CardFooter>
            </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
