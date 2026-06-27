/**
 * Sanity Schema for Menu Items
 * 
 * FOR STUDENTS:
 * In Sanity.io, content models are defined using JavaScript objects called "Schemas".
 * This schema defines what a "Menu Item" looks like in your database and in the Sanity Studio content dashboard.
 */

export const menuItemSchema = {
  // 'name' is the unique identifier used in GROQ queries (e.g. *[_type == "menuItem"])
  name: "menuItem",
  // 'title' is the human-readable label shown in the Sanity UI
  title: "Menu Item",
  // 'document' means this is a top-level independent entity in the database
  type: "document",
  fields: [
    {
      name: "name",
      title: "Dish Name",
      type: "string",
      description: "The name of the neon-inspired food item.",
      validation: (Rule: any) => Rule.required().error("Dish name is required."),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "URL-friendly version of the name (click 'Generate' in Studio).",
      options: {
        source: "name",
        maxLength: 96,
      },
    },
    {
      name: "price",
      title: "Price ($)",
      type: "number",
      description: "The price of the item in USD.",
      validation: (Rule: any) => Rule.required().positive(),
    },
    {
      name: "image",
      title: "Item Image",
      type: "image",
      description: "Upload a vibrant, high-contrast food photo.",
      options: {
        hotspot: true, // Enables cropping and focal point selection in Studio
      },
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      description: "Short mouth-watering summary of ingredients and taste.",
    },
    {
      name: "isFavorite",
      title: "Crowd Favorite?",
      type: "boolean",
      description: "Toggle ON to display this item in the 'Crowd Favorites' section on the landing page.",
      initialValue: false,
    },
  ],
  // Custom preview in Sanity Studio list
  preview: {
    select: {
      title: "name",
      subtitle: "price",
      media: "image",
    },
    prepare(selection: { title: string; subtitle: number; media: any }) {
      const { title, subtitle, media } = selection;
      return {
        title: title,
        subtitle: subtitle ? `$${subtitle.toFixed(2)}` : "No price set",
        media: media,
      };
    },
  },
};
