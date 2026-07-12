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
            <div className="inline-flex items-center gap-2 text-black/60 text-sm font-semibold uppercase tracking-wider mb-2">
              <Smartphone className="w-4 h-4" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item) => (
            <Card key={item._id} className="flex flex-col justify-between bg-white border-black/10 hover:border-black/30 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 aspect-[9/16]">
              <Link href={`/product/${item._id}`} className="block h-full group-hover:opacity-90 transition-opacity">
                <div>
                  {/* Image Container */}
                  <div className="relative w-full aspect-square overflow-hidden bg-white border-b border-black/10 rounded-t-xl flex items-center justify-center p-2">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-contain p-4 transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        No Image Available
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <CardHeader>
                    <CardTitle className="text-black text-lg font-bold">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-sm leading-relaxed">
                      {item.description || "Premium device guaranteed with full shop warranty."}
                    </CardDescription>
                  </CardContent>
                </div>
              </Link>

              {/* Action Footer */}
              <CardFooter className="pt-4 border-t border-black/10 flex-col items-stretch gap-3">
                <div className="flex flex-col items-center w-full bg-black/[0.03] rounded-lg py-2 border border-black/10">
                  {item.originalPrice && (
                    <span className="text-gray-500 text-xs line-through mb-0.5">
                      {item.originalPrice}
                    </span>
                  )}
                  <span className="text-black font-bold text-lg">
                    {item.price}
                  </span>
                </div>

                <a href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`مرحباً، أرغب في شراء: ${item.name}`)}`} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button variant="outline" size="sm" className="w-full gap-2 hover:bg-black hover:text-white transition-all font-semibold border-black/30 text-black cursor-pointer">
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t("nav.order")}</span>
                  </Button>
                </a>
              </CardFooter>
            </Card>
          ))}
          </div>
        )}
      </div>
    </section>
  );
}
