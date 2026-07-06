import * as React from "react";
import { safeFetch, MOCK_CROWD_FAVORITES } from "@/sanity/lib/client";
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
  const favorites: MenuItem[] = await safeFetch<MenuItem[]>(
    CROWD_FAVORITES_QUERY,
    MOCK_CROWD_FAVORITES
  );

  return <CrowdFavoritesClient favorites={favorites} />;
}
