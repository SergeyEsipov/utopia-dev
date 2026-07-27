/**
 * The real 404 route. Use it only for links that genuinely should land there.
 *
 * A CTA with no destination yet must NOT point here — sending a visitor to a
 * 404 reads as broken. Follow the prototype instead: primary CTAs keep their
 * live styling and simply do nothing (no `href`, no navigation), while content
 * links to pages that do not exist yet are rendered disabled.
 */
export const NOT_FOUND_HREF = "/404";

export const CAREERS_HREF = "/careers";

export const TERMS_HREF = "/terms";

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
