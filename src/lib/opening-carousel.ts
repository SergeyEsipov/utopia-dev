export type OpeningSlide = {
  id: string;
  label: string;
  video: string;
  videoWebm?: string;
  poster: string;
  layout: "kitesurf" | "dunes" | "localvibes";
};

export const openingCopy = {
  eyebrow: "Opening in 2027",
  title: "Utopia - Jericoacoara",
  description:
    "Brazil's ultimate kitesurfing mecca. Where dramatic white dunes meet an unmatched, laid-back vibe.",
  cta: "Be Among the First",
};

export const openingSlides: OpeningSlide[] = [
  {
    id: "kitesurfing",
    label: "Kitesurfing",
    // No videoWebm: the design retired /assets/opt/kitesurf.webm — keeping it
    // would make webm-capable browsers play the old clip over the new mp4 cut.
    video: "/assets/opt/kitesurf.mp4",
    poster: "/assets/opt/opening-kitesurf.jpg",
    layout: "kitesurf",
  },
  {
    id: "dunes",
    label: "Dunes Exploration",
    video: "/assets/opt/dunes.mp4",
    poster: "/assets/opt/opening-dunes.jpg",
    layout: "dunes",
  },
  {
    id: "localvibes",
    label: "Local Vibes",
    video: "/assets/opt/localvibes.mp4",
    poster: "/assets/opt/opening-localvibes.jpg",
    layout: "localvibes",
  },
];

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
