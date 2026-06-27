/**
 * Sanity GROQ Queries
 * 
 * FOR STUDENTS:
 * GROQ (Graph-Relational Object Queries) is Sanity's query language.
 * Think of it like SQL, but designed specifically for structured JSON documents.
 */

// Fetches all menu items where isFavorite is marked as true.
// We select only the exact fields our frontend needs for optimal performance.
export const CROWD_FAVORITES_QUERY = `
  *[_type == "menuItem" && isFavorite == true] {
    _id,
    name,
    "slug": slug.current,
    price,
    description,
    "imageUrl": image.asset->url
  }
`;

// Fetches all menu items regardless of favorite status
export const ALL_MENU_ITEMS_QUERY = `
  *[_type == "menuItem"] {
    _id,
    name,
    "slug": slug.current,
    price,
    description,
    "imageUrl": image.asset->url
  }
`;
