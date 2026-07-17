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

export const menuExperienceLinks = ["Experiences"] as const;
export const menuCompanyLinks = ["About", "Careers"] as const;

export const footerMobileLinks = {
  experiences: menuExperienceLinks,
  company: menuCompanyLinks,
};

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
