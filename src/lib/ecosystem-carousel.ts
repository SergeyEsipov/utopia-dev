export type EcosystemLocation = {
  id: string;
  label: string;
  bg: string;
};

export type EcosystemCategory = {
  id: "tropical" | "urban" | "alpine";
  label: string;
  locations: EcosystemLocation[];
};

export const ECOSYSTEM_SLIDE_DURATION_MS = 5500;

/**
 * Image crossfade — prototype `showSlide`'s `FADE_MS = Math.round(380 / 1.3)`
 * with a plain `ease`. Deliberately not the hero's shared crossfade: the
 * destinations swap is noticeably quicker.
 */
export const ECOSYSTEM_CROSSFADE_MS = 292;
export const ECOSYSTEM_CROSSFADE_EASING = "ease";

/* Cabarete, Dubai, Cape Town and Alpine use the designers' own framings from
   desktop_v9 (`dest-*`): the assets we carried were the same renders exported
   at different aspect ratios — Cape Town was a portrait crop of a landscape
   scene — so the destinations window had to centre-crop them hard. The other
   five images are byte-identical scenes and were left alone. */
export const ecosystemCategoryData: EcosystemCategory[] = [
  {
    id: "tropical",
    label: "Tropical",
    locations: [
      {
        id: "jericoacoara",
        label: "Jericoacoara, Brazil",
        bg: "/assets/opt/enhanced_ecosystem-bg-jeri-lobby.jpg",
      },
      {
        id: "flora",
        label: "Flora, Costa Rica",
        bg: "/assets/opt/enhanced_ecosystem-bg-flora-tropical.jpg",
      },
      {
        id: "prea",
        label: "Prea, Brazil",
        bg: "/assets/opt/enhanced_ecosystem-bg-prea-tropical.jpg",
      },
      {
        id: "roca",
        label: "Roca, Costa Rica",
        bg: "/assets/opt/enhanced_ecosystem-bg-roca-tropical.jpg",
      },
      {
        id: "cabarete",
        label: "Cabarete, Dominican Republic",
        bg: "/assets/opt/ecosystem-bg-cabarete-v9.jpg",
      },
    ],
  },
  {
    id: "urban",
    label: "Urban",
    locations: [
      {
        id: "dubai",
        label: "Dubai, UAE",
        bg: "/assets/opt/ecosystem-bg-dubai-v9.jpg",
      },
      {
        id: "barcelona",
        label: "Barcelona, Spain",
        bg: "/assets/opt/enhanced_ecosystem-bg-barcelona-urban.jpg",
      },
      {
        id: "cape-town",
        label: "Cape Town, South Africa",
        bg: "/assets/opt/ecosystem-bg-capetown-v9.jpg",
      },
    ],
  },
  {
    id: "alpine",
    label: "Alpine",
    locations: [
      {
        id: "alpine",
        label: "Alpine",
        bg: "/assets/opt/ecosystem-bg-alpine-v9.jpg",
      },
    ],
  },
];

export type FlatEcosystemSlide = EcosystemLocation & {
  categoryIndex: number;
  slideIndex: number;
  globalIndex: number;
};

export function buildFlatEcosystemSlides(): FlatEcosystemSlide[] {
  const slides: FlatEcosystemSlide[] = [];
  let globalIndex = 0;

  ecosystemCategoryData.forEach((category, categoryIndex) => {
    category.locations.forEach((location, slideIndex) => {
      slides.push({
        ...location,
        categoryIndex,
        slideIndex,
        globalIndex: globalIndex++,
      });
    });
  });

  return slides;
}

export const ecosystemSlides = buildFlatEcosystemSlides();

export function getCategoryProgressRange(
  categoryIndex: number,
  slideIndex: number,
): { start: number; end: number } {
  const count = ecosystemCategoryData[categoryIndex]?.locations.length ?? 1;
  const clampedSlideIndex = Math.max(0, Math.min(count - 1, slideIndex));

  return {
    start: clampedSlideIndex / count,
    end: Math.min(1, (clampedSlideIndex + 1) / count),
  };
}
