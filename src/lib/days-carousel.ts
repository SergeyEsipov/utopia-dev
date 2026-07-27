import {
  privateWorldFraming,
  privateWorldSlidesContent,
  resolveFraming,
  type SlideFraming,
} from "./slides-content.ts";

export type DaysSlide = {
  id: string;
  title: string;
  description: string;
  image: "daysExclusivelyYours" | "daysHyperPersonal" | "daysBeyondService";
  /** How the photo is cropped inside the card. */
  framing: SlideFraming;
};

export const DAYS_AUTOPLAY_MS = 4000;
/* 1000ms / cubic-bezier(0.22, 0.61, 0.36, 1) — prototype `EASE_STR` and its
   card transition. The previous 900ms / (0.22, 1, 0.36, 1) was a different
   curve family: it shot forward and settled slowly, where the prototype is a
   gentler ease-out. */
export const DAYS_TRANSITION_MS = 1000;
export const DAYS_CAPTION_MS = 650;
export const DAYS_EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

/* Copy, image key and per-card framing come from `src/content/slides.json`.
   Card 0 carries the prototype's only per-slide crop: scale(1.1) anchored to
   its bottom-left corner (`.pw-card[data-index="0"] img`, identical in v8/v9). */
export const daysSlides: DaysSlide[] = privateWorldSlidesContent.map(
  (slide) => ({
    id: slide.id,
    title: slide.title,
    description: slide.description,
    image: slide.image as DaysSlide["image"],
    framing: resolveFraming(privateWorldFraming, slide.framing),
  }),
);

export type CardSlot = {
  x: number;
  active: boolean;
};

/** Section layout tiers: mobile <640, tablet 640–1023, desktop 1024–1919, wide >=1920. */
export type DaysBreakpoint = "mobile" | "tablet" | "desktop" | "wide";

/* Figma 24.07 mobile days section (`154:6311`): the 276x366 active card, then
   two 184x244 followers at x=296 and x=500 — and at **y=61**, i.e. centred
   against the active card ((366-244)/2), exactly like every wider tier. The
   prototype v3 keeps its mobile followers top-aligned (`DESIGN_INACTIVE_Y = 0`
   in v3/js/experiences.js) but its card sizes are the older ones too, and the
   rest of this tier already follows 24.07 — so Figma leads here. */
export const daysMobileMetrics = {
  activeW: 276,
  activeH: 366,
  inactiveW: 184,
  inactiveH: 244,
  gap: 20,
  inactiveY: 61,
  peekLeft: -120,
};

/** Figma tablet-768 days section (node 1:1077). */
/* Figma 24.07 `154:5280` and prototype v9's stacked tier agree exactly: the
   768 stage is 1078 wide = 386 + 20 + 326 + 20 + 326, so the active card is
   386x516 and the inactive pair 326x436 — not the 426x570 / 308x412 this
   used to carry, which matched neither source. */
export const daysTabletMetrics = {
  activeW: 386,
  activeH: 516,
  inactiveW: 326,
  inactiveH: 436,
  gap: 20,
  inactiveY: 40,
};

/** Figma desktop-1440 days section (node 1:917). */
export const daysDesktopMetrics = {
  activeW: 386,
  activeH: 516,
  inactiveW: 309,
  inactiveH: 413,
  gap: 20,
  inactiveY: 52,
};

/** Figma desktop-1920 days section (node 1:1763). */
/* Prototype v9's "ultra" tier: cardScale 1.35 over the desktop metrics
   (386x516 -> 521.1x696.6, 308.8x412.8 -> 416.88x557.28) with a 27px gap.
   Figma 24.07 has no frame wider than 1440, so the prototype is the only
   source that covers this tier — the previous 458x612 matched neither. */
export const daysWideMetrics = {
  activeW: 521,
  activeH: 697,
  inactiveW: 417,
  inactiveH: 557,
  gap: 27,
  inactiveY: 70,
};

/**
 * The desktop grid in `days-section.module.css`: a title column, then the
 * belt. Both prototypes centre the *active card* on the screen at every width
 * (`--pw-pad: max(120px, calc(50vw - 580px))` at 1440-1800, `50vw - 596` at
 * 1800+ and `50vw - 740` past 2000 are all "half the screen minus title + gap
 * + half a card"), and where the padding floors out they shrink the belt and
 * the title instead — see `useDaysScaleCap`. `minTitleScale` is the
 * prototype's own floor, 28/36: the title never drops below 28px.
 */
export const daysDesktopLayout = {
  titleColumn: 387,
  columnGap: 20,
  minTitleScale: 28 / 36,
};

export type DaysStackedMetrics = typeof daysDesktopMetrics;

/** Metrics for the desktop-style (stacked slots) layouts — every tier above mobile. */
export function getDaysStackedMetrics(
  breakpoint: Exclude<DaysBreakpoint, "mobile">,
): DaysStackedMetrics {
  switch (breakpoint) {
    case "tablet":
      return daysTabletMetrics;
    case "wide":
      return daysWideMetrics;
    default:
      return daysDesktopMetrics;
  }
}

export function getDaysLayouts(
  activeIndex: number,
  count: number,
  breakpoint: DaysBreakpoint,
): CardSlot[] {
  if (breakpoint !== "mobile") {
    const m = getDaysStackedMetrics(breakpoint);
    const slots = [
      0,
      m.activeW + m.gap,
      m.activeW + m.gap + m.inactiveW + m.gap,
    ];
    return Array.from({ length: count }, (_, slideIndex) => {
      const rel = (slideIndex - activeIndex + count) % count;
      return { x: slots[rel], active: rel === 0 };
    });
  }

  const m = daysMobileMetrics;
  const x2 = m.activeW + m.gap;
  const x3 = m.activeW + m.gap + m.inactiveW + m.gap;
  const layouts = [
    [
      { x: 0, active: true },
      { x: x2, active: false },
      { x: x3, active: false },
    ],
    [
      { x: m.peekLeft, active: false },
      { x: 0, active: true },
      { x: x2, active: false },
    ],
    [
      { x: x2, active: false },
      { x: m.peekLeft, active: false },
      { x: 0, active: true },
    ],
  ];

  return layouts[activeIndex] ?? layouts[0];
}
