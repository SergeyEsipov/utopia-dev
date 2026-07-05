/**
 * Static asset manifest — synced from Figma MCP
 * Re-run: npm run sync:figma-assets
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

export const figmaAssetSources: Record<
  IconName,
  { nodeId: string; figmaUrl: string }
> = {
  logoContainer: {
    nodeId: "173:127",
    figmaUrl:
      "https://www.figma.com/api/mcp/asset/e78f4bae-a6d3-4025-ad73-ff220f78eb9a",
  },
  logoMark: {
    nodeId: "173:127",
    figmaUrl:
      "https://www.figma.com/api/mcp/asset/4d6a169b-2873-49fe-b5c6-9366b3729b12",
  },
  logoWordmark: {
    nodeId: "173:127",
    figmaUrl:
      "https://www.figma.com/api/mcp/asset/01bfe040-4eb2-4de6-a9cd-d7b817e64c59",
  },
  chevron: {
    nodeId: "173:127",
    figmaUrl:
      "https://www.figma.com/api/mcp/asset/8fc80ac4-1328-44af-8188-6c70d1cab739",
  },
  menu: {
    nodeId: "173:127",
    figmaUrl:
      "https://www.figma.com/api/mcp/asset/9200e8ef-455a-4d75-90e3-e9c38beebe20",
  },
  homeMark: {
    nodeId: "173:1888",
    figmaUrl:
      "https://www.figma.com/api/mcp/asset/948551da-feaa-4cb2-b876-84fd338c84e5",
  },
  chevronDark: {
    nodeId: "173:1888",
    figmaUrl:
      "https://www.figma.com/api/mcp/asset/a9193277-ee64-4dec-91f2-8e796e0c9c4a",
  },
  close: {
    nodeId: "173:1839",
    figmaUrl:
      "https://www.figma.com/api/mcp/asset/e136f35c-2ae8-48cd-97f6-eab44b799088",
  },
  dockMark: {
    nodeId: "173:1889",
    figmaUrl:
      "https://www.figma.com/api/mcp/asset/ec57e53a-2da7-4df9-bb68-0f397349352d",
  },
};

export const fonts = {
  gtUltraMedianLight: "/fonts/gt-ultra-median-light.otf",
  gtUltraMedianRegular: "/fonts/gt-ultra-median-regular.otf",
  nbInternationalRegular: "/fonts/nb-international-regular.otf",
} as const;
