"use client";

import { useState } from "react";

const DEFAULT_ACTIVE_ID = "profile";

/**
 * Rail state — there is no "closed" state: `activeId` always holds a value
 * (starting at "profile"), and clicking the already-active icon is a no-op
 * (never toggles the panel shut).
 */
export function useRailFlyoutState() {
  const [activeId, setActiveId] = useState<string>(DEFAULT_ACTIVE_ID);

  const selectItem = (id: string) => {
    if (id === activeId) return;
    setActiveId(id);
  };

  return { activeId, selectItem };
}
