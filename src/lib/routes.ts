/** Placeholder links and CTAs without a real destination */
export const NOT_FOUND_HREF = "/404";

export const CAREERS_HREF = "/careers";

export const TERMS_HREF = "/terms";

export function getCompanyHref(label: string): string {
  if (label === "Careers") return CAREERS_HREF;
  return NOT_FOUND_HREF;
}
