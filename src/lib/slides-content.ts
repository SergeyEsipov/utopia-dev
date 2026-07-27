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

/**
 * desktop_v10's width-anchored crop, one per destination slide.
 *
 * It is not an `object-position`. The photo is laid into a box whose *width*
 * is `width` of the card and whose left edge is `left` of the card, and whose
 * top is derived from the card's width too — `topW` is a percentage of the
 * CARD WIDTH, not of its height. That is the whole point: the numbers were
 * measured against a 1440×680 reference frame (`REF_FRAME_ASPECT`), and
 * driving the vertical off the width keeps the visible slice identical at any
 * card aspect ratio, where percentages of height would silently re-frame it.
 *
 * `anchor` says which edge of that reference frame stays put when the real
 * card is a different height: `bottom` pins the reference bottom to the card
 * bottom, `center` (the default) splits the difference. `nudgeY` lifts a
 * specific photo, and only from 1441px up — it is the designers' hand
 * correction on the wide layout, not a formula.
 */
export type DestinationCrop = {
  /** Left edge of the photo, as a percentage of the card width. */
  left: string;
  /** Photo width, as a percentage of the card width. */
  width: string;
  /** Top edge in the reference frame, as a NUMBER of percent of card width. */
  topW: number;
  anchor?: "top" | "center" | "bottom";
  /** Extra downward nudge in px, applied from 1441px up only. */
  nudgeY?: number;
};

export type DestinationSlideContent = {
  id: string;
  label: string;
  image: string;
  crop?: DestinationCrop;
  /** v10 flags one slide for the reinforced bottom shade. */
  strongShade?: boolean;
  /** Per-slide override of the slider-wide framing (Barcelona's 50% 100%). */
  framing?: Partial<SlideFraming>;
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
  /** Portrait cut — the mobile builds' source (v3 / v9-mobile). */
  video: string;
  poster: string;
  /** Landscape cut — desktop_v8/v9/v10's `fullwidth__bg-video` for the same slide. */
  videoWide: string;
  videoWideWebm: string;
  posterWide: string;
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

/* The cast is the one place the JSON's widened types are narrowed: a string
   literal in a `.json` import is `string`, so `crop.anchor` cannot satisfy
   the "top" | "center" | "bottom" union on its own. Everything downstream
   reads the narrow type. */
export const destinationCategoriesContent =
  content.sliders.destinations.categories as DestinationCategoryContent[];

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
 * The frame desktop_v10's destination crops were measured against: 1440×680.
 * Exported as a number so the percentage lives in exactly one place — the CSS
 * reads it back as `calc(var(--slide-crop-ref) * 1cqw)`.
 */
export const DESTINATION_REF_FRAME_ASPECT = 680 / 1440;

/**
 * The `sizes` hint for a destination photo.
 *
 * `100vw` under-declares it: a v10 crop draws the photo at up to 152% of the
 * card, and in the sharp build the card is already the full viewport — so the
 * browser was choosing a candidate up to a third narrower than the box it
 * then had to fill. The card is never wider than the viewport, so the crop's
 * own width percentage is a correct upper bound.
 */
export function destinationSizes(crop?: DestinationCrop): string {
  const pct = crop ? Number.parseFloat(crop.width) : 100;
  return `${Math.ceil(Number.isFinite(pct) ? Math.max(pct, 100) : 100)}vw`;
}

/** v10's `anchorK`: which edge of the reference frame holds still. */
export function destinationCropAnchor(crop: DestinationCrop): number {
  return crop.anchor === "bottom" ? 1 : crop.anchor === "top" ? 0 : 0.5;
}

/**
 * The half of the crop that is a percentage of the card's width, and so needs
 * no measuring: CSS applies it directly. The vertical half needs the card's
 * height in the same expression and is solved in `useDestinationCrop`.
 */
export function destinationCropStyle(
  crop?: DestinationCrop,
): Record<string, string> {
  if (!crop) return {};

  return {
    "--slide-crop-left": crop.left,
    "--slide-crop-width": crop.width,
  };
}

/**
 * The crop's numbers as data attributes, so the hook can read them off the
 * DOM instead of the component threading them through. `data-crop` alone is
 * what opts an image into the CSS half of the crop.
 */
export function destinationCropAttrs(
  crop?: DestinationCrop,
): Record<string, string> {
  if (!crop) return {};

  return {
    "data-crop": "",
    "data-crop-topw": String(crop.topW),
    "data-crop-anchor": String(destinationCropAnchor(crop)),
    ...(crop.nudgeY ? { "data-crop-nudge": String(crop.nudgeY) } : {}),
  };
}

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
