import {
  openingCopyContent,
  openingSlidesContent,
} from "./slides-content.ts";

export type OpeningSlide = {
  id: string;
  label: string;
  video: string;
  videoWebm?: string;
  poster: string;
  layout: "kitesurf" | "dunes" | "localvibes";
};

/* Copy and media come from `src/content/slides.json`. */
export const openingCopy = openingCopyContent;

export const openingSlides: OpeningSlide[] = openingSlidesContent.map(
  (slide) => ({
    id: slide.id,
    label: slide.label,
    // No videoWebm: the design retired /assets/opt/kitesurf.webm — keeping it
    // would make webm-capable browsers play the old clip over the new mp4 cut.
    video: slide.video,
    poster: slide.poster,
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
