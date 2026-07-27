"use client";

import { HERO_VIDEO_BREAKPOINT_PX } from "@/lib/hero-carousel";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/** Desktop/tablet hero media band (>=768px): landscape posters + bg video. */
export function useHeroDesktopMedia(): boolean {
  return useMediaQuery(`(min-width: ${HERO_VIDEO_BREAKPOINT_PX}px)`);
}

/** Reduced motion: hero stays on the poster, no background video. */
export function useHeroReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
