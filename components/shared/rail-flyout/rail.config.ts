import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { Globe, User, Bell, LifeBuoy, type LucideIcon } from "lucide-react";

/**
 * Component Registry for the rail. Each icon "points to" its own lazily-loaded
 * panel component — adding a new module later is one entry here plus a new
 * panel file, with zero edits to the rail/panel machinery (Open/Closed).
 */
export interface RailItem {
  id: string;
  icon: LucideIcon;
  labelAr: string;
  panel: LazyExoticComponent<ComponentType>;
}

export const railItems: RailItem[] = [
  { id: "language", icon: Globe, labelAr: "اللغة", panel: lazy(() => import("./panels/LanguagePanel")) },
  { id: "account", icon: User, labelAr: "الحساب", panel: lazy(() => import("./panels/AccountPanel")) },
  { id: "notifications", icon: Bell, labelAr: "الإشعارات", panel: lazy(() => import("./panels/NotificationsPanel")) },
  { id: "help", icon: LifeBuoy, labelAr: "المساعدة", panel: lazy(() => import("./panels/HelpPanel")) },
];
