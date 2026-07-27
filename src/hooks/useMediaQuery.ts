"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe `matchMedia` subscription; snapshots `false` on the server.
 *
 * Consumers that pick a *media source* off this must keep the element at
 * `preload="none"` — the server always renders the `false` branch, so anything
 * that fetches straight from the SSR markup would fetch the wrong tier's file
 * and then fetch again after hydration.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
