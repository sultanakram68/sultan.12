import * as React from "react";
import Image from "next/image";
import { Flame, ShoppingBag } from "lucide-react";
import { safeFetch, MOCK_CROWD_FAVORITES } from "@/sanity/lib/client";
import { CROWD_FAVORITES_QUERY } from "@/sanity/lib/queries";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";

export interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

/**
 * Crowd Favorites Section (Server Component)
 * 
 * FOR STUDENTS:
 * Because this component is async, Next.js executes it on the server before sending HTML to the browser.
 * It queries Sanity.io for all dishes marked `isFavorite == true`. If Sanity isn't set up yet,
 * our safeFetch helper automatically supplies the fallback mock data!
 */
export async function CrowdFavorites() {
  // Fetch from Sanity CMS
  const favorites: MenuItem[] = await safeFetch<MenuItem[]>(
    CROWD_FAVORITES_QUERY,
    MOCK_CROWD_FAVORITES
  );

  return (
    <section id="crowd-favorites" className="py-20 bg-neon-dark relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-neon-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-neon-green text-sm font-bold uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4 fill-neon-green animate-bounce" />
              <span>Curated By The Community</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              CROWD <span className="text-neon-green">FAVORITES</span>
            </h2>
          </div>
          <p className="text-gray-400 max-w-md mt-4 md:mt-0 text-sm sm:text-base">
            Our top-rated cyberpunk creations. Real data pulled directly from our Sanity CMS database.
          </p>
        </div>

        {/* Grid of Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {favorites.map((item) => (
            <Card key={item._id} className="flex flex-col justify-between">
              <div>
                {/* Image Container */}
                <div className="relative h-56 w-full overflow-hidden bg-neon-dark/50">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                      No Image Available
                    </div>
                  )}
                  {/* Price Badge overlay */}
                  <div className="absolute top-3 right-3 bg-neon-dark/90 border border-neon-green text-neon-green font-extrabold px-3 py-1 rounded-full text-sm shadow-neon-glow backdrop-blur-md">
                    ${typeof item.price === "number" ? item.price.toFixed(2) : item.price}
                  </div>
                </div>

                {/* Content */}
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {item.description || "A delectable neon specialty crafted with future ingredients."}
                  </CardDescription>
                </CardContent>
              </div>

              {/* Action Footer */}
              <CardFooter className="pt-4 border-t border-neon-border/40">
                <Button variant="outline" size="sm" className="w-full gap-2 group-hover:bg-neon-green group-hover:text-neon-dark transition-all">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add To Order</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
