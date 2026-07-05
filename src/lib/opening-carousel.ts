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
    video: "/assets/opt/kitesurf.mp4",
    videoWebm: "/assets/opt/kitesurf.webm",
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
