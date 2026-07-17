/**
 * Figma node ID registry — updated design (July 2026 redesign)
 *
 * The design lives in a local Figma desktop file (no shareable cloud URL yet);
 * it is read through the local Dev Mode MCP server (`figma-desktop` in .mcp.json),
 * which always targets the file currently open in the Figma desktop app.
 * The previous file (kUT2mAHHQ6MvyKYJZHGHS4, node IDs 173:*) is no longer accessible.
 *
 * Media note: raster/video originals come from the designers' prototype repo
 * (../Utopia, latest iterations: desktop_v3 + v4), not from Figma exports.
 */

export const figmaFile = {
  id: null, // local desktop file — add the file key here once it gets a cloud URL
  name: "Utopia (redesign)",
  url: null,
} as const;

export const figmaNodes = {
  home: {
    mobile: {
      page: "1:2649",
      hero: "1:2650",
      ecosystem: "1:2700",
      opening: "1:2733",
      days: "1:2751",
      footer: "1:2785",
    },
    tablet768: {
      page: "1:981",
      nav: "1:982",
      hero: "1:995",
      ecosystem: "1:1026",
      opening: "1:1060",
      days: "1:1077",
      footer: "1:1101",
    },
    desktop1440: {
      page: "1:818",
      nav: "1:819",
      hero: "1:835",
      ecosystem: "1:866",
      opening: "1:900",
      days: "1:917",
      footer: "1:942",
    },
    desktop1920: {
      page: "1:1649",
      nav: "1:1650",
      hero: "1:1666",
      ecosystem: "1:1712",
      opening: "1:1746",
      days: "1:1763",
      footer: "1:1788",
    },
  },

  careers: {
    // Desktop only — the redesign has no tablet/mobile careers frames.
    desktop1440: {
      page: "1:137",
      header: "1:138",
      hero: "1:167",
      jobs: "1:175",
      teams: "1:270",
      values: "1:310",
      workCarousel: "1:351",
      cta: "1:381",
      footer: "1:390",
    },
  },

  jobOpening: {
    mobile: {
      page: "1:2809",
      nav: "1:2810",
      hero: "1:2823",
      body: "1:2842",
      workCarousel: "1:2880",
      teamUp: "1:2908",
      cta: "1:2945",
      footer: "1:2951",
    },
    tablet768: {
      page: "1:1136",
      nav: "1:1137",
      hero: "1:1150",
      body: "1:1169",
      workCarousel: "1:1207",
      teamUp: "1:1235",
      cta: "1:1263",
      footer: "1:1269",
    },
    desktop1440: {
      page: "1:437",
      nav: "1:438",
      hero: "1:454",
      body: "1:473",
      // Overlapping auto-layout frames between body and footer; verify in Figma
      // when implementing: 1:511 / 1:524 (work carousel area), 1:552 (team-up),
      // 1:581 (work carousel variant).
      workCarousel: "1:524",
      teamUp: "1:552",
      cta: "1:609",
      footer: "1:616",
    },
  },

  terms: {
    mobile: {
      page: "1:2975",
      nav: "1:2976",
      header: "1:2989",
      body: "1:2995",
      footer: "1:3063",
    },
    tablet768: {
      page: "1:1304",
      nav: "1:1305",
      header: "1:1318",
      body: "1:1324",
      footer: "1:1392",
    },
    desktop1440: {
      page: "1:651",
      nav: "1:652",
      header: "1:668",
      body: "1:674",
      footer: "1:783",
    },
  },

  chrome: {
    menuSection: "1:3205", // section container
    menuOverlay: "1:3206",
    openMenuStates: ["1:3087", "1:3149"],
  },

  foundations: {
    typography: "1:3685",
    logo: "1:3806",
    favicon: "1:3808",
    uiKit: "1:3817",
    colors: "1:3890",
  },
} as const;
