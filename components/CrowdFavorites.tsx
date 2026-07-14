import * as React from "react";
import { safeFetch } from "@/sanity/lib/client";
import { CROWD_FAVORITES_QUERY } from "@/sanity/lib/queries";
import { CrowdFavoritesClient } from "./CrowdFavoritesClient";

export interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  price: number | string;
  originalPrice?: number | string;
  description?: string;
  imageUrl?: string;
}

/**
 * Featured Devices & Accessories Section (Server Component fetching data)
 */
export async function CrowdFavorites() {
  // لا صور منتجات وهمية: fallback فاضي، المنتجات الحقيقية بس من Firebase
  const favorites: MenuItem[] = await safeFetch<MenuItem[]>(
    CROWD_FAVORITES_QUERY,
    []
  );

  return <CrowdFavoritesClient favorites={favorites} />;
}
