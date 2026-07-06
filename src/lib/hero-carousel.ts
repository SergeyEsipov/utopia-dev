export type HeroDestination = {
  id: string;
  label: string;
  bg: string;
};

export type HeroCarouselSlide = {
  id: string;
  label: string;
  size: "sm" | "md";
  bgIndex: number | null;
};

export type HeroBackgroundMix = {
  from: number;
  to: number;
  blend: number;
};

export const HERO_SIDE_LABEL = "Jericoacoara, Brazil";

export const heroCarouselDestinations: HeroDestination[] = [
  {
    id: "roca",
    label: "Roca, Costa Rica",
    bg: "/assets/opt/enhanced_hero-bg-roca.jpg",
  },
  {
    id: "cabarete",
    label: "Cabarete, Dominican Republic",
    bg: "/assets/opt/enhanced_hero-bg-cabarete.jpg",
  },
  {
    id: "flora",
    label: "Flora, Costa Rica",
    bg: "/assets/opt/enhanced_hero-bg-flora.jpg",
  },
  {
    id: "barcelona",
    label: "Barcelona, Spain",
    bg: "/assets/opt/enhanced_hero-bg-barcelona-urban.jpg",
  },
  {
    id: "dubai",
    label: "Dubai, UAE",
    bg: "/assets/opt/hero-bg-dubai.jpg",
  },
  {
    id: "cape-town",
    label: "Cape Town, South Africa",
    bg: "/assets/opt/hero-bg-cape-town.jpg",
  },
  {
    id: "jericoacoara",
    label: "Jericoacoara, Brazil",
    bg: "/assets/opt/enhanced_hero-bg-jericoacoara-suite.jpg",
  },
];

export const HERO_SIDE_BG_INDEX = heroCarouselDestinations.length - 1;

export const HERO_CARD_WIDTH = 314;
export const HERO_CARD_GAP = 22;
export const HERO_START_DESTINATION_INDEX = 0;
export const HERO_LOOP_COPIES = 3;
export const HERO_BG_CROSSFADE_MS = 550;
export const HERO_BG_CROSSFADE_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

const sideSlide = (): HeroCarouselSlide => ({
  id: "jericoacoara-side",
  label: HERO_SIDE_LABEL,
  size: "sm",
  bgIndex: HERO_SIDE_BG_INDEX,
});

export function buildHeroCarouselSlides(): HeroCarouselSlide[] {
  const slides: HeroCarouselSlide[] = [sideSlide()];

  heroCarouselDestinations.forEach((dest, index) => {
    slides.push({
      id: dest.id,
      label: dest.label,
      size: "md",
      bgIndex: index,
    });
    slides.push(sideSlide());
  });

  return slides;
}

export const heroCarouselSlides = buildHeroCarouselSlides();

export function destinationProgressFromSlideIndex(slideIndex: number): number {
  const normalized = normalizeSlideIndex(slideIndex);
  return Math.max(
    0,
    Math.min(heroCarouselDestinations.length - 1, (normalized - 1) / 2),
  );
}

export function normalizeSlideIndex(slideIndex: number): number {
  const count = heroCarouselSlides.length;
  return ((slideIndex % count) + count) % count;
}

export function isSideSlideIndex(slideIndex: number): boolean {
  return normalizeSlideIndex(slideIndex) % 2 === 0;
}

function backgroundIndexForSlide(slideIndex: number): number {
  const normalizedSlideIndex = normalizeSlideIndex(slideIndex);
  const slide = heroCarouselSlides[normalizedSlideIndex];
  return slide.bgIndex ?? HERO_SIDE_BG_INDEX;
}

function smoothstep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

export function getBackgroundMixFromRawSlideIndex(
  rawIndex: number,
): HeroBackgroundMix {
  const normalizedRaw = normalizeSlideIndex(rawIndex);
  const nearestSlide = Math.round(rawIndex);
  const isSnapped = Math.abs(rawIndex - nearestSlide) < 0.04;

  if (isSnapped) {
    const destIndex = backgroundIndexForSlide(nearestSlide);
    return { from: destIndex, to: destIndex, blend: 0 };
  }

  const fromSlide = Math.floor(normalizedRaw);
  const toSlide = Math.ceil(normalizedRaw);
  const local = normalizedRaw - fromSlide;
  const from = backgroundIndexForSlide(fromSlide);
  const to = backgroundIndexForSlide(toSlide);

  if (from === to) {
    return { from, to: from, blend: 0 };
  }

  return { from, to, blend: smoothstep(local) };
}

export function getScrollLeftForSlide(
  slideIndex: number,
  trackClientWidth: number,
  paddingLeft: number,
  stride = HERO_CARD_WIDTH + HERO_CARD_GAP,
  cardWidth = HERO_CARD_WIDTH,
): number {
  const viewportCenter = trackClientWidth / 2;
  const slideCenter = paddingLeft + slideIndex * stride + cardWidth / 2;
  return slideCenter - viewportCenter;
}

/** Inverse of getScrollLeftForSlide — raw fractional slide index from scroll position */
export function getRawSlideIndexFromScroll(
  scrollLeft: number,
  trackClientWidth: number,
  paddingLeft: number,
  stride = HERO_CARD_WIDTH + HERO_CARD_GAP,
  cardWidth = HERO_CARD_WIDTH,
): number {
  const viewportCenter = trackClientWidth / 2;
  const slideCenterOffset =
    scrollLeft + viewportCenter - paddingLeft - cardWidth / 2;
  return slideCenterOffset / stride;
}

/** Keeps the carousel in the middle loop copy for infinite scroll */
export function normalizeLoopSlideIndex(
  slideIndex: number,
  baseLength = heroCarouselSlides.length,
): number {
  const lowerBound = baseLength;
  const upperBound = baseLength * 2;

  if (slideIndex < lowerBound) return slideIndex + baseLength;
  if (slideIndex >= upperBound) return slideIndex - baseLength;
  return slideIndex;
}

export function slideIndexForDestination(destinationIndex: number): number {
  return destinationIndex * 2 + 1;
}
