export const spacing = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  15: "60px",
} as const;

export const layout = {
  mobileWidth: 378,
  desktopWidth: 1440,
  contentPaddingX: 16,
  contentPaddingXLg: 32,
  sectionPaddingY: 60,
  dockHeight: 40,
  dockGap: 8,
  heroCard: { width: 314, height: 420 },
  logoSize: 100,
} as const;

export const radii = {
  sm: "16px",
  md: "24px",
  lg: "26px",
  pill: "160px",
  progress: "30px",
} as const;

export const effects = {
  blurLogo: "16px",
  backdropBlur: "10px",
  transitionFast: "150ms ease",
  transitionBase: "250ms ease",
} as const;

export const zIndex = {
  menu: 200,
  overlay: 150,
  dock: 210,
} as const;
