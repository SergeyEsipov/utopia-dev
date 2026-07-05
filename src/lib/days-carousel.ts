export type DaysSlide = {
  id: string;
  title: string;
  description: string;
  image: "daysExclusivelyYours" | "daysHyperPersonal" | "daysBeyondService";
};

export const DAYS_AUTOPLAY_MS = 5000;
export const DAYS_TRANSITION_MS = 700;

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

export const daysMobileMetrics = {
  activeW: 276,
  activeH: 366,
  inactiveW: 184,
  inactiveH: 244,
  gap: 20,
  peekLeft: -120,
};

export const daysDesktopMetrics = {
  activeW: 386,
  activeH: 516,
  inactiveW: 309,
  inactiveH: 413,
  gap: 20,
  inactiveY: 52,
};

export function getDaysLayouts(
  activeIndex: number,
  count: number,
  desktop: boolean,
): CardSlot[] {
  if (desktop) {
    const m = daysDesktopMetrics;
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
