import { useEffect, type RefObject } from "react";

/**
 * Calls `handler` when a pointer/touch press lands outside `ref`. Used to
 * dismiss the flyout panel. Clicks on rail icons live inside `ref`, so they
 * "switch" panels rather than trigger a close.
 */
export function useOnClickOutside(
  ref: RefObject<HTMLElement>,
  handler: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;
    const listener = (e: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el || el.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener, { passive: true });
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, enabled]);
}
