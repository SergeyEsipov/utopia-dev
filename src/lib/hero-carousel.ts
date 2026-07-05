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

export const HERO_CARD_WIDTH = 314;
export const HERO_CARD_GAP = 22;
export const HERO_START_DESTINATION_INDEX = 0;

const sideSlide = (): HeroCarouselSlide => ({
  id: "jericoacoara-side",
  label: HERO_SIDE_LABEL,
  size: "sm",
  bgIndex: null,
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

export function getBackgroundMixFromRawSlideIndex(rawIndex: number): {
  from: number;
  to: number;
  blend: number;
} {
  const normalized = normalizeSlideIndex(Math.round(rawIndex));
  const destProgress = (normalized - 1) / 2;
  const clamped = Math.max(
    0,
    Math.min(heroCarouselDestinations.length - 1, destProgress),
  );
  const from = Math.floor(clamped);
  const to = Math.min(heroCarouselDestinations.length - 1, from + 1);
  return { from, to, blend: clamped - from };
}

export function getScrollLeftForSlide(
  slideIndex: number,
  trackClientWidth: number,
  paddingLeft: number,
): number {
  const stride = HERO_CARD_WIDTH + HERO_CARD_GAP;
  const viewportCenter = trackClientWidth / 2;
  const slideCenter = paddingLeft + slideIndex * stride + HERO_CARD_WIDTH / 2;
  return slideCenter - viewportCenter;
}

export function slideIndexForDestination(destinationIndex: number): number {
  return destinationIndex * 2 + 1;
}
