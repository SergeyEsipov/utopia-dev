import type { MetadataRoute } from "next";

/**
 * Installable-app metadata. Colours are the brand cream the site paints on, so
 * the splash and status bar do not flash white before the page renders.
 * Icons point at the generated routes rather than static files.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Utopia",
    short_name: "Utopia",
    description:
      "Ultra-luxury private estates in the world's ultimate destinations.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f5ea",
    theme_color: "#f9f5ea",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
