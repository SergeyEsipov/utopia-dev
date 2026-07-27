import raw from "../content/slides.json" with { type: "json" };
import type { SiteVariantName } from "./site-variant.ts";

/**
 * Single reader for `src/content/slides.json`.
 *
 * Everything on the site that is a slider — the hero, the destinations
 * carousel, the opening reel and the private-world cards — takes its copy and
 * media from that file through this module. The carousel modules re-export
 * what they need, so components keep importing exactly what they imported
 * before and nothing downstream knows the content moved.
 *
 * When the CMS lands, only this file changes: swap the static import for the
 * fetch, keep the types, and every consumer is already decoupled.
 */

/** How a photo sits inside its frame — the prototype's per-image treatments. */
export type SlideFraming = {
  objectPosition: string;
  scale: number;
  transformOrigin: string;
};

export type HeroSlideContent = {
  id: string;
  label: string;
  image: string;
  poster: string;
  video: string;
};

export type DestinationSlideContent = {
  id: string;
  label: string;
  image: string;
};

export type DestinationCategoryContent = {
  id: string;
  label: string;
  slides: DestinationSlideContent[];
};

export type OpeningSlideContent = {
  id: string;
  label: string;
  layout: string;
  video: string;
  poster: string;
};

export type PrivateWorldSlideContent = {
  id: string;
  title: string;
  description: string;
  image: string;
  framing?: Partial<SlideFraming>;
};

type RawContent = typeof raw;

const content = raw as RawContent;

export const framingDefaults: SlideFraming = {
  objectPosition: content.framingDefaults.objectPosition,
  scale: content.framingDefaults.scale,
  transformOrigin: content.framingDefaults.transformOrigin,
};

export const heroSlidesContent: HeroSlideContent[] = content.sliders.hero.slides;

export const destinationCategoriesContent: DestinationCategoryContent[] =
  content.sliders.destinations.categories;

export const openingCopyContent = content.sliders.opening.copy;

export const openingSlidesContent: OpeningSlideContent[] =
  content.sliders.opening.slides;

export const privateWorldSlidesContent: PrivateWorldSlideContent[] =
  content.sliders.privateWorld.slides;

/**
 * Destinations framing. desktop_v8 centres the photo inside its 1200-wide
 * card; desktop_v9 crops it full-bleed and taller, so the designers anchor it
 * to the bottom edge instead. Both values come from the builds themselves.
 */
export function getDestinationsFraming(variant: SiteVariantName): SlideFraming {
  const { framing } = content.sliders.destinations;
  const byVariant = framing.objectPositionByVariant as Record<string, string>;

  return {
    ...framingDefaults,
    objectPosition: byVariant[variant] ?? framing.objectPosition,
  };
}

/**
 * Framing composes in three layers: the file-wide defaults, then whatever the
 * slider sets for all of its slides, then the slide's own override. A CMS can
 * fill any of the three without the others knowing.
 */
export function resolveFraming(
  ...layers: (Partial<SlideFraming> | undefined)[]
): SlideFraming {
  return layers.reduce<SlideFraming>(
    (acc, layer) => ({ ...acc, ...layer }),
    framingDefaults,
  );
}

/** Slider-wide framing for the private-world cards. */
export const privateWorldFraming = content.sliders.privateWorld
  .framing as Partial<SlideFraming>;

/**
 * Framing as custom properties, so a slide can carry its own crop without the
 * component branching on slide identity. Consumers spread this onto `style`.
 */
export function framingStyle(
  framing?: Partial<SlideFraming>,
): Record<string, string> {
  const resolved = resolveFraming(framing);

  return {
    "--slide-object-position": resolved.objectPosition,
    "--slide-scale": String(resolved.scale),
    "--slide-transform-origin": resolved.transformOrigin,
  };
}
