import type { MetadataRoute } from "next";
import { getJobPostings } from "@/lib/revolut-people";
import { CAREERS_HREF, TERMS_HREF } from "@/lib/routes";
import { siteUrl } from "@/lib/site";

/** Job listings come from the live ATS, so refresh on the same cadence. */
export const revalidate = 900;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Without a known origin every URL would resolve against localhost, which is
  // worse than shipping no sitemap at all.
  if (!siteUrl) return [];

  // Captured so the narrowing survives into the closure below.
  const origin = siteUrl;
  const absolute = (path: string) => new URL(path, origin).toString();
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: absolute("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: absolute(CAREERS_HREF),
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: absolute(TERMS_HREF),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // A failed ATS fetch returns null; ship the static pages rather than nothing.
  const postings = await getJobPostings();
  const jobEntries: MetadataRoute.Sitemap = (postings ?? []).map((posting) => ({
    url: absolute(`${CAREERS_HREF}/${posting.slug}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...jobEntries];
}
