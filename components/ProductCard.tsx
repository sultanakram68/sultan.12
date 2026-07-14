"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ShoppingCart, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { MenuItem } from "./CrowdFavorites";

const NOTCH_TOP_RIGHT_FRAC = 0.14;
const NOTCH_TOP_LEFT_FRAC = 0.34;
const NOTCH_RADIUS = 20;
const NOTCH_BORDER = 1.25;

/** Builds a rounded-corner polygon path (quadratic-bezier corners) for use in `clip-path: path(...)`. */
function roundedPolygonPath(points: [number, number][], radius: number): string {
  const n = points.length;
  const segments: string[] = [];
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];

    const v1x = curr[0] - prev[0];
    const v1y = curr[1] - prev[1];
    const v1len = Math.hypot(v1x, v1y) || 1;
    const r1 = Math.min(radius, v1len / 2);
    const startX = curr[0] - (v1x / v1len) * r1;
    const startY = curr[1] - (v1y / v1len) * r1;

    const v2x = next[0] - curr[0];
    const v2y = next[1] - curr[1];
    const v2len = Math.hypot(v2x, v2y) || 1;
    const r2 = Math.min(radius, v2len / 2);
    const endX = curr[0] + (v2x / v2len) * r2;
    const endY = curr[1] + (v2y / v2len) * r2;

    segments.push(i === 0 ? `M ${startX} ${startY}` : `L ${startX} ${startY}`);
    segments.push(`Q ${curr[0]} ${curr[1]} ${endX} ${endY}`);
  }
  segments.push("Z");
  return segments.join(" ");
}

function notchPoints(w: number, h: number): [number, number][] {
  return [
    [w, h * NOTCH_TOP_RIGHT_FRAC],
    [w, h],
    [0, h],
    [0, h * NOTCH_TOP_LEFT_FRAC],
  ];
}

/**
 * Measures the shape layer and computes two clip-path polygons (a slightly
 * larger black one behind, a slightly smaller white one in front) so a thin
 * border traces the *entire* silhouette — including the diagonal notch,
 * which plain CSS `border` can't do since it only follows the box's
 * original rectangular edges, not a clip-path's custom ones.
 */
function useNotchPaths(ref: React.RefObject<HTMLDivElement>) {
  const [paths, setPaths] = React.useState<{ outer: string; inner: string } | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const compute = () => {
      const { width: w, height: h } = el.getBoundingClientRect();
      if (!w || !h) return;
      const b = NOTCH_BORDER;
      setPaths({
        outer: roundedPolygonPath(notchPoints(w, h), NOTCH_RADIUS),
        inner: roundedPolygonPath(notchPoints(w - b * 2, h - b * 2), Math.max(NOTCH_RADIUS - b, 0)),
      });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return paths;
}

/**
 * LIMIXI "breakout" product card (design brief §5–§6): the product image
 * overflows past the top edge of the signature card shape, which sits
 * behind it as a separate absolutely-positioned layer so the shape's
 * clip-path doesn't clip the product photo too.
 *
 * Card face kept black-and-white per direct art direction: white shape,
 * thin black outline (including along the diagonal notch), black
 * text/price/CTA — the LIMIXI accent color is reserved for the bottom
 * nav's active-tab glow, not the catalog cards.
 */
export function ProductCard({ item }: { item: MenuItem }) {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const shapeRef = React.useRef<HTMLDivElement>(null);
  const shapePaths = useNotchPaths(shapeRef);

  const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
  const originalPrice = item.originalPrice
    ? typeof item.originalPrice === "string" ? parseFloat(item.originalPrice) : item.originalPrice
    : undefined;
  const hasDiscount = !!originalPrice && originalPrice > price;
  const discountPct = hasDiscount ? Math.round((1 - price / originalPrice!) * 100) : 0;

  const orderHref = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    `مرحباً، أرغب في شراء: ${item.name}`
  )}`;

  const cartHref = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    `مرحباً، أرغب في إضافة هذا المنتج إلى طلبي: ${item.name}`
  )}`;

  return (
    <div className="group relative pt-8">
      {/* Signature shape layer, kept separate from the image so its clip-path
          doesn't mask the breakout product photo. filter:drop-shadow (not
          box-shadow) because box-shadow gets cut off by clip-path. */}
      <div
        ref={shapeRef}
        className="absolute inset-x-0 bottom-0 top-[13%] transition-transform duration-300 ease-out group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:transform-none"
        style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,.15)) drop-shadow(0 4px 12px rgba(0,0,0,.08))" }}
        aria-hidden="true"
      >
        {/* Outer layer = the thin black outline, showing only as a rim around the inner white fill */}
        <div
          className="limixi-card-shape absolute inset-0 bg-black"
          style={shapePaths ? { clipPath: `path("${shapePaths.outer}")`, borderRadius: 0, border: "none" } : undefined}
        />
        <div
          className="absolute bg-white"
          style={{
            inset: NOTCH_BORDER,
            clipPath: shapePaths ? `path("${shapePaths.inner}")` : undefined,
            borderRadius: shapePaths ? 0 : 26,
          }}
        />
      </div>

      <Link
        href={`/product/${item._id}`}
        className="relative block rounded-limixi-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
      >
        {/* Breakout stage */}
        <div className="relative w-full aspect-[4/6] flex items-end justify-center px-6 pb-4">
          {!imageLoaded && item.imageUrl && (
            <div className="absolute inset-x-10 bottom-4 top-10 rounded-3xl bg-black/5 animate-pulse" aria-hidden="true" />
          )}

          {item.imageUrl ? (
            <>
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                onLoad={() => setImageLoaded(true)}
                className={`relative z-10 object-contain drop-shadow-xl transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:transform-none ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </>
          ) : (
            <div className="relative z-10 text-black/50 text-xs">No Image Available</div>
          )}
        </div>

        {/* Text content, sitting inside the shape's visual bounds */}
        <div className="relative z-10 px-5 pb-1 pt-1 space-y-1">
          <h3 className="text-black text-[15px] font-semibold line-clamp-1">{item.name}</h3>
          <p className="text-black/60 text-xs leading-relaxed line-clamp-2">
            {item.description || "Premium device guaranteed with full shop warranty."}
          </p>
        </div>
      </Link>

      <div className="relative z-10 px-5 pb-5 pt-2 flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-black font-extrabold text-xl">{item.price}</span>
          {hasDiscount && (
            <>
              <span className="text-black/40 text-sm line-through">{item.originalPrice}</span>
              <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                −{discountPct}%
              </span>
            </>
          )}
        </div>

        {/* Buy now (text) + Add-to-cart (icon only, with a +), same B/W style */}
        <div className="flex items-center gap-2">
          <a href={orderHref} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0">
            <Button
              size="sm"
              className="w-full gap-1.5 bg-black text-white hover:bg-black/85 active:scale-[0.98] transition-all font-semibold rounded-full cursor-pointer text-xs px-2"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span className="truncate">اشتري الآن</span>
            </Button>
          </a>

          <a href={cartHref} target="_blank" rel="noopener noreferrer" aria-label="أضف للسلة" className="shrink-0">
            <Button
              size="sm"
              className="relative w-10 h-9 p-0 grid place-items-center bg-white text-black border border-black/25 hover:bg-black/5 active:scale-[0.98] transition-all rounded-full cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <Plus className="absolute top-1 end-1.5 w-2.5 h-2.5" strokeWidth={3.5} />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
