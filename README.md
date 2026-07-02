# ⚡ Adessa - Next.js & Sanity Landing Page

Welcome to the **Adessa** educational repository! This project is a responsive, vibrant landing page built to teach students modern web development concepts using **Next.js 14/15 (App Router)**, **Shadcn UI design patterns**, and **Sanity.io Headless CMS**.

---

## 🚀 Getting Started (Step-by-Step for Students)

### 1. Open the Project Folder
Open your terminal and navigate to this project folder:
```bash
cd "c:\Users\lenovo\OneDrive\Pictures\Desktop\neon-bites"
```

### 2. Install Dependencies
Install all required Node packages (React, Next.js, Tailwind CSS, Lucide icons, and Sanity):
```bash
npm install
```

### 3. Run the Development Server
Start the development server to preview the landing page live:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. You will see the glowing cyberpunk aesthetic immediately!

---

## 💡 How It Works (Architecture Overview)

### 🎨 Styling & Aesthetic (Shadcn UI + Tailwind CSS)
- **Tailwind Config (`tailwind.config.ts`)**: We customized the color theme with `#39FF14` (Neon Green) and `#0a0f0d` (Dark Slate).
- **Reusable UI Components (`/components/ui`)**: Instead of relying on external libraries, we built modular, reusable components (`Button`, `Card`) following Shadcn UI best practices. Notice how `cn(...)` cleanly merges Tailwind classes!

### 🍔 Content Management (Sanity.io Integration)
- **Schema (`sanity/schemaTypes/menuItem.ts`)**: Defines the structure of a menu item (`name`, `price`, `image`, `isFavorite`).
- **GROQ Queries (`sanity/lib/queries.ts`)**: We query Sanity using `*[_type == "menuItem" && isFavorite == true]` to fetch only items marked as "Crowd Favorites".
- **Built-in Fallback (`sanity/lib/client.ts`)**: Don't have your API keys yet? Don't worry! Our `safeFetch` function automatically loads high-quality mock data so you can test the layout right out of the box.

### 🧭 Navigation & Jump Links
- The sticky navigation (`components/Navbar.tsx`) includes links to `#crowd-favorites`, `#product-details`, and `#contact-us`.
- Clicking any link smoothly scrolls down the page to the matching component section ID.

---

## 🔧 Connecting Your Own Sanity Studio (Optional Challenge)

Want to manage real data from cloud?
1. Create a free project at [https://sanity.io](https://sanity.io).
2. Create a `.env.local` file in the root directory with your keys:
   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_SANITY_DATASET=production
   ```
3. Add your menu items in the Sanity Studio dashboard, toggle **Crowd Favorite?** to `ON`, and watch your landing page update automatically!

Happy Coding! 🎉
