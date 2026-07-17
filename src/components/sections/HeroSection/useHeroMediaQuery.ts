"use client";

import { useCallback, useSyncExternalStore } from "react";
import { HERO_VIDEO_BREAKPOINT_PX } from "@/lib/hero-carousel";

/** SSR-safe matchMedia subscription; snapshots false on the server. */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** Desktop/tablet hero media band (>=768px): landscape posters + bg video. */
export function useHeroDesktopMedia(): boolean {
  return useMediaQuery(`(min-width: ${HERO_VIDEO_BREAKPOINT_PX}px)`);
}

/** Reduced motion: hero stays on the poster, no background video. */
export function useHeroReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
