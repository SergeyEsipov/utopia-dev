export type DaysSlide = {
  id: string;
  title: string;
  description: string;
  image: "daysExclusivelyYours" | "daysHyperPersonal" | "daysBeyondService";
};

export const DAYS_AUTOPLAY_MS = 4000;
export const DAYS_TRANSITION_MS = 900;
export const DAYS_CAPTION_MS = 650;
export const DAYS_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export const daysSlides: DaysSlide[] = [
  {
    id: "exclusively-yours",
    title: "Exclusively Yours",
    description: "We do not book rooms — we hand over keys to entire estates.",
    image: "daysExclusivelyYours",
  },
  {
    id: "hyper-personal",
    title: "Hyper-Personal",
    description:
      "We curate a dedicated team for your stay — from master instructors and specialized sports gear to local guides.",
    image: "daysHyperPersonal",
  },
  {
    id: "beyond-service",
    title: "Beyond Seven-Star Service",
    description:
      "Private chefs, world-class gastronomy, and seamless entertainment, delivered flawlessly.",
    image: "daysBeyondService",
  },
];

export type CardSlot = {
  x: number;
  active: boolean;
};

/** Section layout tiers: mobile <640, tablet 640–1023, desktop 1024–1919, wide >=1920. */
export type DaysBreakpoint = "mobile" | "tablet" | "desktop" | "wide";

export const daysMobileMetrics = {
  activeW: 276,
  activeH: 366,
  inactiveW: 184,
  inactiveH: 244,
  gap: 20,
  peekLeft: -120,
};

/** Figma tablet-768 days section (node 1:1077). */
export const daysTabletMetrics = {
  activeW: 426,
  activeH: 570,
  inactiveW: 308,
  inactiveH: 412,
  gap: 20,
  inactiveY: 79,
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
export const daysWideMetrics = {
  activeW: 458,
  activeH: 612,
  inactiveW: 360,
  inactiveH: 482,
  gap: 20,
  inactiveY: 65,
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
