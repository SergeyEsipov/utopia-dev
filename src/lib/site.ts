import type { Metadata } from "next";

/**
 * Absolute origin of the deployed site. Used for `metadataBase`, canonical
 * URLs and OG tags, all of which must be absolute.
 *
 * Resolution order: `NEXT_PUBLIC_SITE_URL`, then the production domain Vercel
 * injects (host only, no protocol). When neither is set this is `null` and
 * callers emit no canonical at all — Next would otherwise resolve a relative
 * canonical against `http://localhost:3000` and ship a wrong absolute URL,
 * which is worse for SEO than shipping none.
 */
function readSiteUrl(): URL | null {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (!configured) return null;

  const withProtocol = /^https?:\/\//i.test(configured)
    ? configured
    : `https://${configured}`;
  try {
    return new URL(withProtocol);
  } catch {
    console.warn(`site: ignoring unparseable NEXT_PUBLIC_SITE_URL "${configured}"`);
    return null;
  }
}

export const siteUrl = readSiteUrl();

/** `alternates` for a root-relative path, omitted when the origin is unknown. */
export function alternatesFor(path: string): Metadata["alternates"] {
  return siteUrl ? { canonical: path } : undefined;
}
