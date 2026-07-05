export const images = {
  logo: "/assets/LOGO.svg",
  logoDark: "/assets/LOGO-dark.svg",
  logoMark: "/assets/logo-mark.svg",
  heroEmblem: "/assets/hero-emblem.svg",
  navWordmark: "/assets/logo-wordmark-dark.svg",

  heroBg: "/assets/opt/enhanced_hero-bg-roca.jpg",
  heroBgDesktop: "/assets/opt/enhanced_hero-bg-roca.jpg",

  ecosystemBg: "/assets/opt/enhanced_ecosystem-bg-jeri-lobby.jpg",

  openingPoster: "/assets/opt/opening-kitesurf.jpg",

  daysExclusivelyYours: "/assets/opt/days-exclusively-yours.jpg",
  daysHyperPersonal: "/assets/opt/days-water.jpg",
  daysBeyondService: "/assets/opt/days-dining.jpg",

  footerPoster: "/assets/opt/cta-footer-poster.jpg",
  footerWordmark: "/assets/footer-wordmark.svg",
} as const;

export const videos = {
  kitesurf: "/assets/opt/kitesurf.mp4",
  kitesurfWebm: "/assets/opt/kitesurf.webm",
  tropics: "/assets/opt/tropics.mp4",
  tropicsWebm: "/assets/opt/tropics.webm",
  wellness: "/assets/opt/wellness.mp4",
  wellnessWebm: "/assets/opt/wellness.webm",
  footer: "/assets/footer.mp4",
  footerWebm: "/assets/footer.webm",
  dunes: "/assets/opt/dunes.mp4",
  jet: "/assets/opt/jet.mp4",
  jetWebm: "/assets/opt/jet.webm",
  yacht: "/assets/opt/yacht.mp4",
  yachtWebm: "/assets/opt/yacht.webm",
  localvibes: "/assets/opt/localvibes.mp4",
} as const;

export type ImageKey = keyof typeof images;
export type VideoKey = keyof typeof videos;
