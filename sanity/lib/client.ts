import { createClient } from "next-sanity";

/**
 * Sanity Client Helper
 * 
 * FOR STUDENTS:
 * This file creates the connection between your Next.js application and Sanity cloud.
 * To protect beginner students who haven't set up their `.env.local` API keys yet,
 * we include built-in fallback data so the landing page works immediately out-of-the-box!
 */

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "demo-project-id";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-06-01";

// Check if actual credentials are configured
const isConfigured = projectId !== "demo-project-id";

export const client = isConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true, // Use Edge CDN for super fast response times
    })
  : null;

// Mock Fallback Data representing Featured Devices & Accessories from Sultan Mobile
export const MOCK_CROWD_FAVORITES = [
  {
    _id: "fav-1",
    name: "iPhone 15 Pro Max (Titanium)",
    slug: "iphone-15-pro-max",
    price: 1199.00,
    description: "Certified pre-owned & new sealed devices with 100% battery health and full official shop warranty.",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "fav-2",
    name: "AirPods Pro (2nd Gen & Wireless)",
    slug: "airpods-pro-2nd-gen",
    price: 249.00,
    description: "Active noise cancellation wireless earbuds with customized protective silicone carrying case.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "fav-3",
    name: "Fast Chargers & MagSafe Accessories",
    slug: "fast-chargers-magsafe",
    price: 35.00,
    description: "Original fast-charging adapters, armored cables, and MagSafe wireless charging pads.",
    imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "fav-4",
    name: "Smart Watches & Fitness Bands",
    slug: "smart-watches",
    price: 199.00,
    description: "Latest smartwatches with heart rate monitoring, OLED displays, and interchangeable straps.",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  },
];

/**
 * Helper function to safely fetch data from Sanity or fallback to mock data
 */
export async function safeFetch<T>(query: string, fallbackData: T): Promise<T> {
  if (!client) {
    console.warn("⚠️ Sanity credentials missing in .env.local. Loading demo fallback data for students.");
    return fallbackData;
  }
  try {
    const data = await client.fetch<T>(query);
    return data || fallbackData;
  } catch (error) {
    console.error("❌ Error fetching from Sanity:", error);
    return fallbackData;
  }
}
