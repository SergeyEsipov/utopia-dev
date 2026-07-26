import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * `/404` is a real route here (alongside Next's not-found handling), so it is
 * excluded explicitly — otherwise crawlers index a soft 404. The design-system
 * showcase is internal.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/404", "/design-system"],
    },
    // Omitted when the origin is unknown: a relative sitemap URL is invalid,
    // and pointing at localhost would be worse than pointing nowhere.
    sitemap: siteUrl ? new URL("/sitemap.xml", siteUrl).toString() : undefined,
  };
}
