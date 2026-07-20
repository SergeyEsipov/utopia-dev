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
 * Mobile footer + slide-menu links. Prototype v3 (Figma 3882:3013,
 * commits ab3e267 / b6ab764): "Experiences" renamed to "Contact", order
 * Contact → Careers → About, and About is disabled (coming later).
 */
export const menuLinks = [
  { label: "Contact" },
  { label: "Careers" },
  { label: "About", disabled: true },
] as const;

export const footerDesktopLinks = {
  experiences: ["Experiences", "Private Jet", "Superyacht"],
  company: ["About", "Careers"],
};

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
