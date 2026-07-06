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

  careerTeamDesign: "/assets/careers/team-design.jpg",
  careerTeamOperations: "/assets/careers/team-operations.jpg",
  careerTeamResorts: "/assets/careers/team-resorts.jpg",
  careerTeamLegal: "/assets/careers/team-legal.jpg",
  careerTeamTechnical: "/assets/careers/team-technical.jpg",
  careerTeamFinance: "/assets/careers/team-finance.jpg",
  careerValuesHero: "/assets/careers/values-hero-bg.jpg",
  careerValueNeverSettle: "/assets/careers/value-never-settle.png",
  careerValueDreamTeam: "/assets/careers/value-dream-team.png",
  careerValueThinkDeeper: "/assets/careers/value-think-deeper.png",
  careerValueGetItDone: "/assets/careers/value-get-it-done.png",
  careerValueDeliverWow: "/assets/careers/value-deliver-wow.png",
  careerWorkGuests: "/assets/careers/work-guests.jpg",
  careerWorkRemote: "/assets/careers/work-remote.jpg",
  careerWorkLocations: "/assets/careers/work-locations.jpg",
  careerWorkTeam: "/assets/careers/work-team.jpg",
  careerWorkCompensation: "/assets/careers/work-compensation.jpg",

  careerOfficeIcon: "/assets/icons/career-office.svg",
  careerRemoteIcon: "/assets/icons/career-remote.svg",
  careerChevronDown: "/assets/icons/career-chevron-down.svg",
  careerSearchIcon: "/assets/icons/career-search.svg",
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
