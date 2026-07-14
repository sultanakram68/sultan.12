import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { User, Bell, Settings, Globe, Info, type LucideIcon } from "lucide-react";

/**
 * Component Registry. Order is fixed by priority — append new units at the
 * end, never reorder existing ones. Each panel is lazily loaded.
 */
export interface RailItem {
  id: string;
  icon: LucideIcon;
  label: string;
  panelComponent: LazyExoticComponent<ComponentType>;
}

export const railItems: RailItem[] = [
  { id: "profile", icon: User, label: "الحساب", panelComponent: lazy(() => import("./panels/ProfilePanel")) },
  { id: "notifications", icon: Bell, label: "الإشعارات", panelComponent: lazy(() => import("./panels/NotificationsPanel")) },
  { id: "settings", icon: Settings, label: "الإعدادات", panelComponent: lazy(() => import("./panels/SettingsPanel")) },
  { id: "language", icon: Globe, label: "اللغة", panelComponent: lazy(() => import("./panels/LanguagePanel")) },
  { id: "developer", icon: Info, label: "عن المطوّر", panelComponent: lazy(() => import("./panels/DeveloperPanel")) },
];
