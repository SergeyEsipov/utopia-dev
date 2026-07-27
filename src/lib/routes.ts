/**
 * The real 404 route. Use it only for links that genuinely should land there.
 *
 * A CTA with no destination yet must NOT point here — sending a visitor to a
 * 404 reads as broken. Follow the prototype instead: primary CTAs keep their
 * live styling and simply do nothing (no `href`, no navigation), while content
 * links to pages that do not exist yet are rendered disabled.
 */
export const NOT_FOUND_HREF = "/404";

export const HOME_HREF = "/";

export const CAREERS_HREF = "/careers";

export const TERMS_HREF = "/terms";

export const PRIVACY_HREF = "/privacy";

/**
 * Destination for a company link, or `undefined` when that page does not exist
 * yet. Callers render the undefined case as an inert element — passing
 * `href={undefined}` to an <a> simply omits the attribute, which keeps the
 * styling while removing the navigation.
 */
export function getCompanyHref(label: string): string | undefined {
  if (label === "Careers") return CAREERS_HREF;
  return undefined;
}

/**
 * `true` when a company link has no page to go to yet, so the caller must
 * render it inert rather than as a live link.
 *
 * `menuLinks` only marks About `disabled`, which left Contact rendering as a
 * real anchor: it carried the hover arrow and full opacity, but had no `href`
 * and so did nothing when clicked — a control that looks live and is dead.
 * Deriving the inert state from the routing table instead of the data file
 * keeps the two from drifting: anything `getCompanyHref` cannot resolve is
 * inert, and adding the page is the single edit that makes it live again.
 */
export function isCompanyLinkInert(label: string): boolean {
  return getCompanyHref(label) === undefined;
}
