"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";

interface GalleryImage {
  url: string;
  overlayText?: string;
  overlayColor?: string;
  overlaySize?: "sm" | "md" | "lg" | "xl";
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string | number;
  originalPrice?: string | number;
  imageUrl: string;
  gallery?: GalleryImage[];
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { settings } = useSettings();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!params?.id) return;

    const unsubscribe = onSnapshot(doc(db, "products", params.id as string), (docSnap) => {
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
      } else {
        setProduct(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching product:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-black mb-4">المنتج غير موجود</h1>
        <p className="text-gray-600 mb-8">عذراً، يبدو أن هذا المنتج قد تم حذفه أو غير متوفر حالياً.</p>
        <Button onClick={() => router.push("/")} variant="outline" className="border-black/30 text-black hover:bg-black hover:text-white">
          العودة للرئيسية
        </Button>
      </div>
    );
  }

  // Combine main image and gallery images into a single array for the carousel
  const allImages: GalleryImage[] = [
    { url: product.imageUrl, overlayText: product.name, overlayColor: "#ffffff", overlaySize: "lg" }
  ];

  if (product.gallery && product.gallery.length > 0) {
    allImages.push(...product.gallery);
  }

  const nextSlide = () => setCurrentSlide((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));

  const getSizeClass = (size?: string) => {
    switch(size) {
      case "sm": return "text-sm sm:text-base";
      case "md": return "text-xl sm:text-3xl font-bold";
      case "lg": return "text-3xl sm:text-5xl font-bold";
      case "xl": return "text-5xl sm:text-7xl font-black";
      default: return "text-xl sm:text-3xl font-bold";
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors mb-8 group bg-black/[0.03] px-4 py-2 rounded-full border border-black/10 backdrop-blur-sm inline-flex"
        >
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <span className="font-medium">العودة للمنتجات</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Carousel Section */}
          <div className="relative w-full aspect-[4/5] sm:aspect-square bg-white rounded-3xl overflow-hidden border border-black/10 shadow-[0_2px_20px_rgba(0,0,0,0.08)] group">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-center p-8"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={allImages[currentSlide].url}
                  alt={product.name}
                  className="w-full h-full object-contain drop-shadow-2xl"
                />

                {/* Text Overlay */}
                {allImages[currentSlide].overlayText && (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center pointer-events-none z-10" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent, rgba(0,0,0,0.15))' }}>
                    <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className={`drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] ${getSizeClass(allImages[currentSlide].overlaySize)}`}
                      style={{ color: allImages[currentSlide].overlayColor || '#ffffff' }}
                    >
                      {allImages[currentSlide].overlayText}
                    </motion.h2>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Carousel Controls */}
            {allImages.length > 1 && (
              <>
                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center backdrop-blur-md transition-all z-20">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center backdrop-blur-md transition-all z-20">
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentSlide ? "bg-white w-6" : "bg-white/50 hover:bg-white"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="inline-block px-3 py-1 bg-black/[0.03] border border-black/15 text-black rounded-full text-xs font-bold tracking-widest uppercase mb-6">
                Sultan Premium
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-black mb-6 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-end gap-4 mb-8 pb-8 border-b border-black/10">
                <span className="text-5xl font-black text-black tracking-tight">
                  {product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-2xl text-gray-500 line-through mb-1">
                    {product.originalPrice}
                  </span>
                )}
              </div>

              {product.description && (
                <div className="mb-10">
                  <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-black"></span>
                    الوصف والتفاصيل
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`مرحباً، أرغب في طلب: ${product.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block"
              >
                <Button className="w-full h-16 text-xl font-bold bg-black hover:bg-gray-800 text-white transition-all flex items-center justify-center gap-3 rounded-2xl">
                  <ShoppingBag className="w-6 h-6" />
                  اطلب الآن عبر واتساب
                </Button>
              </a>

              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="bg-black/[0.02] p-4 rounded-2xl border border-black/10">
                  <div className="text-black font-bold mb-1">✓</div>
                  <div className="text-gray-600 text-xs">ضمان المتجر</div>
                </div>
                <div className="bg-black/[0.02] p-4 rounded-2xl border border-black/10">
                  <div className="text-black font-bold mb-1">✓</div>
                  <div className="text-gray-600 text-xs">أصلية 100%</div>
                </div>
                <div className="bg-black/[0.02] p-4 rounded-2xl border border-black/10">
                  <div className="text-black font-bold mb-1">✓</div>
                  <div className="text-gray-600 text-xs">توصيل سريع</div>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
