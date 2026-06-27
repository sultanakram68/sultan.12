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

// Mock Fallback Data representing Crowd Favorites from the Neon Bites aesthetic
export const MOCK_CROWD_FAVORITES = [
  {
    _id: "fav-1",
    name: "Cyberpunk Glaze Burger",
    slug: "cyberpunk-glaze-burger",
    price: 18.50,
    description: "Double smashed Wagyu beef infused with neon jalapeño relish, aged cheddar, and charcoal brioche.",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "fav-2",
    name: "Matrix Matcha Boba Shake",
    slug: "matrix-matcha-boba-shake",
    price: 9.00,
    description: "Ceremonial grade green tea matcha layered with glowing tapioca pearls and coconut cream.",
    imageUrl: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "fav-3",
    name: "Neon Green Wasabi Tacos",
    slug: "neon-green-wasabi-tacos",
    price: 16.00,
    description: "Crispy tempura shrimp tacos topped with glowing lime-wasabi crema and pickled purple cabbage.",
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "fav-4",
    name: "Electric Lime Cheesecake",
    slug: "electric-lime-cheesecake",
    price: 12.00,
    description: "Velvety cheesecake with a glowing key lime mirror glaze on an oreo dark cocoa crust.",
    imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
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
