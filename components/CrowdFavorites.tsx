import * as React from "react";
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
 * Featured Devices & Accessories. Products stream in live on the client via
 * Firebase onSnapshot (see CrowdFavoritesClient) — we intentionally do NOT
 * prefetch them on the server, because the images are stored as large base64
 * data URIs in Firestore and embedding them into the SSR HTML blows up build
 * memory and bloats the payload.
 */
export function CrowdFavorites() {
  return <CrowdFavoritesClient favorites={[]} />;
}
