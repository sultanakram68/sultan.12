"use client";

import * as React from "react";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag, ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/hooks/useSettings";

/**
 * Slide-in cart panel (official website). Lists the added products with
 * quantity controls, a running total, and a WhatsApp checkout that sends the
 * whole order. Strictly black/white to match the LIMIXI catalog cards.
 */
export function CartDrawer() {
  const { items, count, total, isOpen, close, remove, setQty, clear } = useCart();
  const { settings } = useSettings();

  // Lock background scroll while open
  React.useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const checkoutHref = React.useMemo(() => {
    const lines = items.map((i) => `• ${i.name} × ${i.qty}`).join("\n");
    const msg = `مرحباً، أرغب في طلب المنتجات التالية:\n${lines}\n\nالإجمالي التقريبي: ${total}`;
    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }, [items, total, settings.whatsappNumber]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          {/* Panel (slides in from the left for RTL) */}
          <motion.aside
            dir="rtl"
            className="fixed inset-y-0 left-0 z-[120] w-[88%] max-w-sm bg-white text-black flex flex-col shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="سلة المشتريات"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 border-b border-black/10"
              style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)", paddingBottom: "16px" }}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h2 className="text-lg font-bold">السلة</h2>
                {count > 0 && (
                  <span className="bg-black text-white text-xs font-bold rounded-full min-w-5 h-5 px-1.5 grid place-items-center">
                    {count}
                  </span>
                )}
              </div>
              <button
                onClick={close}
                aria-label="إغلاق"
                className="w-9 h-9 rounded-full bg-black/[0.06] hover:bg-black/10 grid place-items-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-black/50 py-16">
                  <ShoppingBag className="w-10 h-10" />
                  <p className="text-sm font-medium">سلتك فارغة</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-3 rounded-2xl border border-black/10 p-2.5">
                      <div className="relative w-16 h-16 shrink-0 rounded-xl bg-black/[0.04] overflow-hidden grid place-items-center">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-1" sizes="64px" />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-black/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold line-clamp-2">{item.name}</p>
                          <button
                            onClick={() => remove(item.id)}
                            aria-label="حذف"
                            className="shrink-0 text-black/40 hover:text-black transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{item.price}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setQty(item.id, item.qty - 1)}
                              aria-label="إنقاص"
                              className="w-7 h-7 rounded-full border border-black/20 grid place-items-center hover:bg-black/5 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold">{item.qty}</span>
                            <button
                              onClick={() => setQty(item.id, item.qty + 1)}
                              aria-label="زيادة"
                              className="w-7 h-7 rounded-full border border-black/20 grid place-items-center hover:bg-black/5 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                className="border-t border-black/10 px-5 pt-4 space-y-3"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-black/60 text-sm">الإجمالي</span>
                  <span className="text-xl font-extrabold">{total}</span>
                </div>
                <a
                  href={checkoutHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-black text-white font-semibold rounded-full py-3 hover:bg-black/85 active:scale-[0.99] transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>إتمام الطلب عبر واتساب</span>
                </a>
                <button
                  onClick={clear}
                  className="w-full text-black/50 hover:text-black text-xs font-medium transition-colors"
                >
                  تفريغ السلة
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
