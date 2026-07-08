export type HeroDestination = {
  id: string;
  label: string;
  bg: string;
};

export type HeroCarouselSlide = {
  id: string;
  label: string;
  bgIndex: number;
};

export type HeroBackgroundMix = {
  from: number;
  to: number;
  blend: number;
};

export const heroCarouselDestinations: HeroDestination[] = [
  {
    id: "roca",
    label: "Roca, Costa Rica",
    bg: "/assets/hero-bg-roca.png",
  },
  {
    id: "cabarete",
    label: "Cabarete, Dominican Republic",
    bg: "/assets/hero-bg-cabarete.png",
  },
  {
    id: "flora",
    label: "Flora, Costa Rica",
    bg: "/assets/opt/enhanced_hero-bg-flora.jpg",
  },
  {
    id: "barcelona",
    label: "Barcelona, Spain",
    bg: "/assets/hero-bg-barcelona-urban.png",
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
    bg: "/assets/hero-bg-jericoacoara-suite.png",
  },
];

export const HERO_DESTINATION_COUNT = heroCarouselDestinations.length;

export const HERO_CARD_WIDTH = 314;
export const HERO_CARD_GAP = 22;
export const HERO_CARD_SLOT_DESKTOP = 590;
export const HERO_CARD_SIDE_WIDTH_DESKTOP = 472;
export const HERO_CARD_SIDE_SHIFT_DESKTOP =
  (HERO_CARD_SLOT_DESKTOP - HERO_CARD_SIDE_WIDTH_DESKTOP) / 2;
export const HERO_CARD_GAP_DESKTOP = 40;
export const HERO_DESKTOP_BREAKPOINT_PX = 1024;
export const HERO_START_DESTINATION_INDEX = 0;
export const HERO_LOOP_COPIES = 3;
export const HERO_BG_CROSSFADE_MS = 550;
export const HERO_BG_CROSSFADE_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

export function buildHeroCarouselSlides(): HeroCarouselSlide[] {
  return heroCarouselDestinations.map((dest, index) => ({
    id: dest.id,
    label: dest.label,
    bgIndex: index,
  }));
}

export const heroCarouselSlides = buildHeroCarouselSlides();

export function destinationProgressFromSlideIndex(slideIndex: number): number {
  return normalizeSlideIndex(slideIndex);
}

export function normalizeSlideIndex(slideIndex: number): number {
  const count = heroCarouselSlides.length;
  return ((slideIndex % count) + count) % count;
}

function backgroundIndexForSlide(slideIndex: number): number {
  return normalizeSlideIndex(slideIndex);
}

function smoothstep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

export function getBackgroundMixFromRawSlideIndex(
  rawIndex: number,
): HeroBackgroundMix {
  const nearestSlide = Math.round(rawIndex);
  const isSnapped = Math.abs(rawIndex - nearestSlide) < 0.04;

  if (isSnapped) {
    const destIndex = backgroundIndexForSlide(nearestSlide);
    return { from: destIndex, to: destIndex, blend: 0 };
  }

  const fromSlide = Math.floor(rawIndex);
  const toSlide = Math.ceil(rawIndex);
  const local = rawIndex - fromSlide;
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

export function getScrollLeftForSlideElement(
  trackClientWidth: number,
  slideOffsetLeft: number,
  slideOffsetWidth: number,
): number {
  const slideCenter = slideOffsetLeft + slideOffsetWidth / 2;
  return slideCenter - trackClientWidth / 2;
}

export function getScrollLeftForSlideNode(
  track: HTMLElement,
  slide: HTMLElement,
): number {
  const trackRect = track.getBoundingClientRect();
  const slideRect = slide.getBoundingClientRect();
  const slideCenter = slideRect.left + slideRect.width / 2;
  const trackCenter = trackRect.left + trackRect.width / 2;
  return track.scrollLeft + (slideCenter - trackCenter);
}

export type HeroSlideOffset = {
  offsetLeft: number;
  offsetWidth: number;
  centerX: number;
};

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

export function getRawSlideIndexFromSlideElements(
  scrollLeft: number,
  trackClientWidth: number,
  slideOffsets: readonly HeroSlideOffset[],
): number {
  if (slideOffsets.length === 0) return 0;

  const viewportCenter = scrollLeft + trackClientWidth / 2;

  return getRawSlideIndexFromSlideCenters(
    viewportCenter,
    slideOffsets.map((slide) => slide.centerX),
  );
}

export function getRawSlideIndexFromSlideCenters(
  viewportCenter: number,
  slideCenters: readonly number[],
): number {
  if (slideCenters.length === 0) return 0;

  if (viewportCenter <= slideCenters[0]) {
    return 0;
  }

  for (let i = 0; i < slideCenters.length - 1; i++) {
    const currentCenter = slideCenters[i];
    const nextCenter = slideCenters[i + 1];

    if (viewportCenter >= currentCenter && viewportCenter <= nextCenter) {
      if (nextCenter === currentCenter) return i;
      return i + (viewportCenter - currentCenter) / (nextCenter - currentCenter);
    }
  }

  return slideCenters.length - 1;
}

export function getRawSlideIndexFromSlideNodes(
  track: HTMLElement,
  slides: readonly HTMLElement[],
): number {
  if (slides.length === 0) return 0;

  const trackRect = track.getBoundingClientRect();
  const viewportCenter = trackRect.left + trackRect.width / 2;
  const slideCenters = slides.map(
    (slide) => slide.getBoundingClientRect().left + slide.getBoundingClientRect().width / 2,
  );

  return getRawSlideIndexFromSlideCenters(viewportCenter, slideCenters);
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
  return destinationIndex;
}
