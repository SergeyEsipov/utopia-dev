import type { HeroBackgroundMix } from "./hero-carousel";

export type HeroBackgroundLayerMode = "single" | "crossfade";

export type HeroBackgroundLayers = {
  mode: HeroBackgroundLayerMode;
  /** Visible destination indices (1 or 2 items) */
  indices: number[];
  /** Opacity per index, same order as indices */
  opacities: number[];
};

export type HeroBackgroundRenderLayer = {
  index: number;
  opacity: number;
  zIndex: number;
};

/** Maps bg mix state to the layers the UI should render */
export function resolveHeroBackgroundLayers(
  bgMix: HeroBackgroundMix,
): HeroBackgroundLayers {
  const { from, to, blend } = bgMix;
  const showCrossfade = from !== to && blend > 0.001 && blend < 0.999;

  if (showCrossfade) {
    return {
      mode: "crossfade",
      indices: [from, to],
      // Bottom layer stays fully opaque so page background never bleeds through.
      opacities: [1, blend],
    };
  }

  const activeIndex = blend >= 0.999 ? to : from;
  return {
    mode: "single",
    indices: [activeIndex],
    opacities: [1],
  };
}

/** Keeps every image mounted while only the visible layers change opacity */
export function resolveHeroBackgroundRenderLayers(
  bgMix: HeroBackgroundMix,
  layerCount: number,
): HeroBackgroundRenderLayer[] {
  const visibleLayers = resolveHeroBackgroundLayers(bgMix);

  return Array.from({ length: layerCount }, (_, index) => {
    const visibleIndex = visibleLayers.indices.indexOf(index);

    if (visibleIndex === -1) {
      return { index, opacity: 0, zIndex: 0 };
    }

    return {
      index,
      opacity: visibleLayers.opacities[visibleIndex],
      zIndex: visibleIndex + 1,
    };
  });
}

/** At rest, only one destination should be fully visible */
export function isRestingBackground(mix: HeroBackgroundMix): boolean {
  return mix.from === mix.to && mix.blend === 0;
}
