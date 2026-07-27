export const footerDestinations = {
  Tropical: [
    { label: "Jericoacoara, Brazil", active: true },
    { label: "Flora, Costa Rica" },
    { label: "Prea, Brazil" },
    { label: "Roca, Costa Rica" },
    { label: "Cabarete, Dominican Republic" },
  ],
  Urban: [
    { label: "Dubai, UAE" },
    { label: "Barcelona, Spain" },
    { label: "Cape Town, South Africa" },
  ],
  Alpine: [{ label: "Coming soon" }],
};

/**
 * Categories for the mobile/tablet menu and footer — Figma 24.07 `154:7935`
 * (open menu) and `154:6360` (footer). Two changes from the desktop list: the
 * "Destinations" heading above them is gone, and Experiences joins as a fourth
 * row. Kept separate from `footerDestinations` because the desktop menu and
 * footer already render Experiences as its own column and would double it.
 */
export const mobileMenuCategories = {
  ...footerDestinations,
  Experiences: [{ label: "Coming soon" }],
};

/**
 * Mobile footer + slide-menu links. Prototype v3 (Figma 3882:3013,
 * commits ab3e267 / b6ab764): "Experiences" renamed to "Contact", order
 * Contact → Careers → About, and About is disabled (coming later).
 */
export const menuLinks = [
  { label: "Contact" },
  { label: "Careers" },
  { label: "About", disabled: true },
] as const;

/** Desktop footer social row (prototype desktop_v9 .footer__social). */
export const footerSocials = [
  { label: "Facebook", icon: "/assets/social-facebook.svg" },
  { label: "WhatsApp", icon: "/assets/social-whatsapp.svg" },
  { label: "Instagram", icon: "/assets/social-instagram.svg" },
  { label: "Telegram", icon: "/assets/social-telegram.svg" },
  { label: "LinkedIn", icon: "/assets/social-linkedin.svg" },
] as const;

export const navLinks = ["About", "Careers"] as const;

/** Desktop nav dropdown — featured destination card (Figma 1:3270) */
export const menuFeaturedCard = {
  title: "Jericoacoara 2027",
  subtitle: "Be among first to book",
  image: "/assets/menu/nav-menu-tropical.jpg",
} as const;

/** Desktop nav dropdown — Experiences cards (Figma 1:3296 / 1:3297) */
export const menuExperienceCards = [
  {
    title: "Private Aviation",
    subtitle: "Seamless inter-sanctuary transit",
    image: "/assets/menu/nav-menu-aviation.jpg",
  },
  {
    title: "Superyacht",
    subtitle: "Raw oceanic expeditions",
    image: "/assets/menu/nav-menu-superyacht.jpg",
  },
] as const;
