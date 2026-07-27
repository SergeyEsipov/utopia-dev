import {
  destinationCategoriesContent,
  type DestinationSlideContent,
} from "./slides-content.ts";

export type EcosystemLocation = {
  id: string;
  label: string;
  bg: string;
  /**
   * desktop_v10's `strongShade`: one slide asks for the reinforced bottom
   * wash because its own photograph is bright enough to swallow the white
   * filter labels that now sit on it. Opt-in per slide, false everywhere
   * else, so the component never learns which slide it is.
   */
  strongShade: boolean;
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

/* Categories, labels and image paths come from `src/content/slides.json`.

   Cabarete, Dubai, Cape Town and Alpine use the designers' own framings from
   desktop_v9 (`dest-*`): the assets we carried were the same renders exported
   at different aspect ratios — Cape Town was a portrait crop of a landscape
   scene — so the destinations window had to centre-crop them hard. The other
   five images are byte-identical scenes and were left alone. */
export const ecosystemCategoryData: EcosystemCategory[] =
  destinationCategoriesContent.map((category) => ({
    id: category.id as EcosystemCategory["id"],
    label: category.label,
    locations: category.slides.map((slide) => ({
      id: slide.id,
      label: slide.label,
      bg: slide.image,
      /* `strongShade` is optional in slides.json and not yet part of
         `DestinationSlideContent`, so it is read defensively: the flag works
         the moment the field is added to the file, and its absence is just
         `false`. */
      strongShade:
        (slide as DestinationSlideContent & { strongShade?: boolean })
          .strongShade === true,
    })),
  }));

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
