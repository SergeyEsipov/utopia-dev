export const heroDestinations = [
  { id: "prea", label: "Prea, Brazil", size: "sm" as const },
  { id: "roca", label: "Roca, Costa Rica", size: "md" as const, active: true },
  { id: "dubai", label: "Dubai, UAE", size: "sm" as const },
] as const;

export const ecosystemCategories = ["Tropical", "Urban", "Alpine"] as const;

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

export const menuExperienceLinks = ["Private jet", "Superyacht"] as const;
export const menuCompanyLinks = ["About", "Careers"] as const;

export const footerMobileLinks = {
  experiences: menuExperienceLinks,
  company: menuCompanyLinks,
};

export const footerDesktopLinks = {
  experiences: ["Experiences", "Private Jet", "Superyacht"],
  company: ["About", "Careers"],
};

export const navDestinations = ["Tropical", "Urban", "Alpine"] as const;
export const navLinks = ["About", "Careers"] as const;
