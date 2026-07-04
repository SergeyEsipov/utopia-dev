/** Unified desktop-final.html — pick mobile vs desktop section roots at ≥900px.
 *  Standalone v2/index.html has no adapt-* markup — always use mobile selectors. */
export const DESKTOP_MQ = "(min-width: 900px)";

export function isDesktopViewport() {
  return window.matchMedia(DESKTOP_MQ).matches;
}

function stripAdaptSelector(selector) {
  return selector.replace(/\.adapt-(mobile|desktop)\b/g, "").replace(/\s+/g, " ").trim();
}

export function queryAdaptive(mobileSelector, desktopSelector) {
  const isAdaptivePage = !!document.querySelector(".adapt-mobile, .adapt-desktop");
  const selector = isAdaptivePage
    ? isDesktopViewport()
      ? desktopSelector
      : mobileSelector
    : stripAdaptSelector(mobileSelector);

  return document.querySelector(selector);
}
