"use client";

import * as React from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

/** Cart icon with a live item-count badge; opens the cart drawer. */
export function CartButton({ className = "" }: { className?: string }) {
  const { count, open } = useCart();
  return (
    <button
      onClick={open}
      aria-label="السلة"
      className={`relative p-2 rounded-full text-gray-700 hover:text-black hover:bg-black/5 transition-colors ${className}`}
    >
      <ShoppingCart className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 grid place-items-center">
          {count}
        </span>
      )}
    </button>
  );
}
