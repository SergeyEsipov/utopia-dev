/**
 * Static icon manifest — committed SVGs under public/assets/icons.
 */

export const icons = {
  logoContainer: "/assets/icons/logo-container.svg",
  logoMark: "/assets/icons/logo-mark.svg",
  logoWordmark: "/assets/icons/logo-wordmark.svg",
  chevron: "/assets/icons/chevron.svg",
  chevronDark: "/assets/icons/chevron-dark.svg",
  menu: "/assets/icons/menu.svg",
  close: "/assets/icons/close.svg",
  homeMark: "/assets/icons/home-mark.svg",
  dockMark: "/assets/icons/dock-mark.svg",
} as const;

export type IconName = keyof typeof icons;
