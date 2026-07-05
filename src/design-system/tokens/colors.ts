export const colors = {
  bg: {
    cream: "#f9f5ea",
    white: "#ffffff",
    menu: "#f3f3f3",
    ecosystem: "#e6dccd",
    placeholder: "#d9d9d9",
  },
  text: {
    primary: "#161514",
    muted: "rgba(22, 21, 20, 0.6)",
    inverse: "#ffffff",
    black: "#000000",
  },
  ui: {
    dock: "rgba(229, 218, 203, 0.8)",
    pill: "rgba(249, 245, 234, 0.6)",
    cardBorder: "rgba(229, 218, 203, 0.7)",
    tabInactive: "rgba(255, 255, 255, 0.4)",
    tabBorder: "rgba(255, 255, 255, 0.2)",
    progressTrack: "rgba(0, 0, 0, 0.06)",
    progressFill: "#000000",
    progressFillMuted: "rgba(0, 0, 0, 0.4)",
  },
} as const;

export type ColorToken = typeof colors;
