import { redirect } from "next/navigation";

/**
 * Root Landing Page - Automatically redirects to POS Cashier Screen as the official home of the site.
 */
export default function HomePage() {
  redirect("/pos");
}
