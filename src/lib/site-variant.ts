"use client";

import { useSyncExternalStore } from "react";

/**
 * The two prototype builds the client is choosing between:
 *
 *   rounded → https://embacydev.github.io/Utopia/desktop_v8
 *   sharp   → https://embacydev.github.io/Utopia/desktop_v9/
 *
 * They differ in more than corner radii (those live in tokens.css under
 * `:root[data-variant="sharp"]`): the fullwidth section's scroll choreography
 * is retuned, and the hero → destinations handoff uses a different mechanism.
 * Everything version-specific that JS needs is collected here so components
 * read one source instead of branching on the variant themselves.
 */
export type SiteVariantName = "rounded" | "sharp";

export type SiteVariantConfig = {
  /** Which prototype build this mirrors. */
  source: string;
  /** Fullwidth ("Opening") section scale-on-scroll — prototype constants. */
  fullwidth: {
    startRadius: number;
    peakRadius: number;
    scaleStartOffset: number;
    scaleDistance: number;
    contentRevealAt: number;
  };
  /**
   * Hero → destinations handoff. v8 commits straight into the card morph;
   * v9 additionally snaps the section into place before/around it.
   */
  transition: {
    snap: boolean;
    /** Snap timings (ms); null when the variant has no snap stage. */
    snapDurationMs: number | null;
    heroToDestDurationMs: number | null;
    momentumLullMs: number;
    momentumMaxMs: number;
  };
};

/** Morph constants that are identical in both builds. */
export const MORPH = {
  durationMs: 833,
  swapStart: 0.55,
  landFrac: 0.38,
  seedRadius: 20,
  imageRadius: 24,
} as const;

export const SITE_VARIANTS: Record<SiteVariantName, SiteVariantConfig> = {
  rounded: {
    source: "desktop_v8",
    fullwidth: {
      startRadius: 24,
      peakRadius: 32,
      scaleStartOffset: -0.2,
      scaleDistance: 0.5,
      contentRevealAt: 0.7,
    },
    transition: {
      snap: false,
      snapDurationMs: null,
      heroToDestDurationMs: null,
      momentumLullMs: 250,
      momentumMaxMs: 420,
    },
  },
  sharp: {
    source: "desktop_v9",
    fullwidth: {
      startRadius: 0,
      peakRadius: 0,
      scaleStartOffset: 0.58,
      scaleDistance: 1.28,
      contentRevealAt: 0.98,
    },
    transition: {
      snap: true,
      snapDurationMs: 660,
      heroToDestDurationMs: 820,
      momentumLullMs: 260,
      momentumMaxMs: 560,
    },
  },
};

export const DEFAULT_VARIANT: SiteVariantName = "rounded";

function readVariant(): SiteVariantName {
  const value = document.documentElement.dataset.variant;
  return value === "sharp" ? "sharp" : "rounded";
}

/**
 * Subscribes to `data-variant` on <html>, which SiteVariant sets from
 * `?variant=` / sessionStorage after mount — so a runtime switch re-renders
 * anything reading this.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-variant"],
  });
  return () => observer.disconnect();
}

/** Current variant name. SSR renders the default. */
export function useSiteVariantName(): SiteVariantName {
  return useSyncExternalStore(subscribe, readVariant, () => DEFAULT_VARIANT);
}

/** Current variant's animation config. */
export function useSiteVariant(): SiteVariantConfig {
  return SITE_VARIANTS[useSiteVariantName()];
}
