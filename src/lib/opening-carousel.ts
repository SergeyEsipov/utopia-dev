import {
  openingCopyContent,
  openingSlidesContent,
} from "./slides-content.ts";

export type OpeningSlide = {
  id: string;
  label: string;
  /** Portrait cut, phones only. The -mobile/.hevc encodes derive from it. */
  video: string;
  poster: string;
  /** Landscape cut, >=OPENING_WIDE_BREAKPOINT_PX. webm leads, as in both desktop builds. */
  videoWide: string;
  videoWideWebm: string;
  posterWide: string;
  layout: "kitesurf" | "dunes" | "localvibes";
};

/* Copy and media come from `src/content/slides.json`. */
export const openingCopy = openingCopyContent;

/**
 * Where the section stops being the phone layout and goes full-bleed
 * (`opening-section.module.css`'s own 640 block), so it is also where the
 * portrait clip stops fitting and the landscape one takes over. Deliberately
 * not the hero's 768: this section switches its own layout at 640.
 */
export const OPENING_WIDE_BREAKPOINT_PX = 640;

export const openingSlides: OpeningSlide[] = openingSlidesContent.map(
  (slide) => ({
    id: slide.id,
    label: slide.label,
    // No webm on the portrait cut: the design retired /assets/opt/kitesurf.webm
    // — keeping it would make webm-capable browsers play the old edit over the
    // current mp4. The landscape cut's webm is a different, current file.
    video: slide.video,
    poster: slide.poster,
    videoWide: slide.videoWide,
    videoWideWebm: slide.videoWideWebm,
    posterWide: slide.posterWide,
    layout: slide.layout as OpeningSlide["layout"],
  }),
);

export const OPENING_SLIDE_COUNT = openingSlides.length;
export const OPENING_LOOP_COPIES = 3;
export const OPENING_START_INDEX = OPENING_SLIDE_COUNT;
export const OPENING_TRANSITION_MS = 550;

export function normalizeOpeningSlideIndex(loopIndex: number): number {
  return (
    ((loopIndex % OPENING_SLIDE_COUNT) + OPENING_SLIDE_COUNT) %
    OPENING_SLIDE_COUNT
  );
}

/** Keeps the carousel in the middle loop copy for infinite scroll */
export function normalizeOpeningLoopIndex(
  loopIndex: number,
  baseLength = OPENING_SLIDE_COUNT,
): number {
  const lowerBound = baseLength;
  const upperBound = baseLength * 2;

  if (loopIndex < lowerBound) return loopIndex + baseLength;
  if (loopIndex >= upperBound) return loopIndex - baseLength;
  return loopIndex;
}
