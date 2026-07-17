export const images = {
  logo: "/assets/LOGO.svg",
  logoDark: "/assets/LOGO-dark.svg",
  logoMark: "/assets/logo-mark.svg",
  heroEmblem: "/assets/hero-emblem.svg",
  navWordmark: "/assets/logo-wordmark-dark.svg",

  heroBg: "/assets/opt/enhanced_hero-bg-roca.jpg",
  heroBgDesktop: "/assets/desktop/hero-bg-roca.jpg",

  ecosystemBg: "/assets/opt/enhanced_ecosystem-bg-jeri-lobby.jpg",

  openingPoster: "/assets/opt/opening-kitesurf.jpg",

  // Design order: 1 Exclusively Yours (oranges card), 2 Hyper-Personal (yoga),
  // 3 Beyond Seven-Star Service (dining plate). pw-* are the desktop-resolution
  // sources; *-mobile are the small v4 exports for the mobile layout.
  daysExclusivelyYours: "/assets/opt/days-exclusively-yours.jpg",
  daysExclusivelyYoursMobile: "/assets/opt/days-exclusively-yours-mobile.jpg",
  daysHyperPersonal: "/assets/desktop/pw-2.jpg",
  daysBeyondService: "/assets/desktop/pw-3.jpg",
  daysBeyondServiceMobile: "/assets/opt/days-dining.jpg",

  // Desktop hero (desktop_v3): per-destination poster jpg, paired with
  // heroVideo* in videos below.
  heroPosterRoca: "/assets/desktop/hero-bg-roca.jpg",
  heroPosterCabarete: "/assets/desktop/hero-bg-cabarete.jpg",
  heroPosterFlora: "/assets/desktop/hero-bg-flora.jpg",
  heroPosterBarcelona: "/assets/desktop/hero-bg-barcelona.jpg",
  heroPosterDubai: "/assets/desktop/hero-bg-dubai.jpg",
  heroPosterCapeTown: "/assets/desktop/hero-bg-capetown.jpg",
  heroPosterJericoacoara: "/assets/desktop/hero-bg-jericoacoara.jpg",
  heroBg1920: "/assets/desktop/hero-bg-1920.jpg",

  // Desktop fullwidth "Opening 2027" slider posters (videos below).
  fullwidthKitesurfingPoster: "/assets/desktop/fullwidth-kitesurfing.png",
  fullwidthDunesPoster: "/assets/desktop/fullwidth-dunes.png",
  fullwidthBirdsPoster: "/assets/desktop/fullwidth-birds.png",

  // Desktop destinations tabs.
  destTropical1: "/assets/desktop/dest-tropical-1.jpg",
  destTropical2: "/assets/desktop/dest-tropical-2.jpg",
  destTropical3: "/assets/desktop/dest-tropical-3.jpg",
  destTropical4: "/assets/desktop/dest-tropical-4.jpg",
  destTropical5: "/assets/desktop/dest-tropical-5.jpg",
  destUrban1: "/assets/desktop/dest-urban-1.jpg",
  destUrban2: "/assets/desktop/dest-urban-2.jpg",
  destUrban3: "/assets/desktop/dest-urban-3.jpg",
  destAlpine1: "/assets/desktop/dest-alpine-1.jpg",

  // Desktop Private World carousel.
  pw1: "/assets/desktop/pw-1.jpg",
  pw2: "/assets/desktop/pw-2.jpg",
  pw3: "/assets/desktop/pw-3.jpg",

  // Desktop nav / menu overlay.
  navMenuIcon: "/assets/desktop/nav-menu-icon.svg",
  navPillMenu: "/assets/desktop/nav-pill-menu.svg",
  navArrowBlack: "/assets/desktop/nav-arrow-black.svg",
  navMenuBg: "/assets/desktop/nav-menu-bg.jpg",
  navMenuTropical: "/assets/desktop/nav-menu-tropical.jpg",
  navMenuAviation: "/assets/desktop/nav-menu-aviation.jpg",
  navMenuSuperyacht: "/assets/desktop/nav-menu-superyacht.jpg",

  // Desktop hero chrome (social-icons-nav.svg is the UTOPIA wordmark).
  heroWordmarkDesktop: "/assets/desktop/social-icons-nav.svg",
  heroLogoIconDesktop: "/assets/desktop/logo-icon.svg",
  heroArrowIconDesktop: "/assets/desktop/arrow-icon.svg",
  chevronDesktop: "/assets/desktop/chevron.svg",

  // Desktop footer.
  footerRock: "/assets/desktop/footer-rock.jpg",
  footerSocialFacebook: "/assets/desktop/footer-social-facebook.svg",
  footerSocialWhatsapp: "/assets/desktop/footer-social-whatsapp.svg",
  footerSocialInstagram: "/assets/desktop/footer-social-instagram.svg",
  footerSocialTelegram: "/assets/desktop/footer-social-telegram.svg",
  footerSocialLinkedin: "/assets/desktop/footer-social-linkedin.svg",

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
  careerWorkLocations: "/assets/careers/work-locations.jpg",
  careerWorkTeam: "/assets/careers/work-team.jpg",
  careerWorkCompensation: "/assets/careers/work-compensation.jpg",

  careerOfficeIcon: "/assets/icons/career-office.svg",
  careerRemoteIcon: "/assets/icons/career-remote.svg",
  careerChevronDown: "/assets/icons/career-chevron-down.svg",
  careerSearchIcon: "/assets/icons/career-search.svg",

  jobOfficeIcon: "/assets/job-opening/job-office.svg",
  jobRemoteIcon: "/assets/job-opening/job-remote.svg",
  jobTeamUpTeaRoom: "/assets/job-opening/teamup-tea-room.jpg",
  jobTeamUpChess: "/assets/job-opening/teamup-chess.jpg",
  jobTeamUpTablet: "/assets/job-opening/teamup-tablet.jpg",
  jobTeamUpDot: "/assets/job-opening/teamup-dot.svg",
} as const;

export type ImageKey = keyof typeof images;
