/** iOS Safari: 100vw is wider than the visible viewport — use innerWidth instead.
 *  v3/v4 desktop: cap layout to 378px column and phone-proportional height. */
const MOBILE_LAYOUT_MQ = "(max-width: 520px)";
const LAYOUT_COLUMN_PX = 378;
/** iPhone-class logical viewport (393×852) — keeps hero proportions on desktop */
const PHONE_VIEWPORT_RATIO = 852 / 393;

export function initViewport() {
  const root = document.documentElement;

  function sync() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (window.matchMedia(MOBILE_LAYOUT_MQ).matches) {
      root.style.setProperty("--app-width", `${w}px`);
      root.style.setProperty("--app-height", `${h}px`);
    } else {
      const layoutW = Math.min(w, LAYOUT_COLUMN_PX);
      const phoneHeight = Math.round(layoutW * PHONE_VIEWPORT_RATIO);
      root.style.setProperty("--app-width", `${layoutW}px`);
      root.style.setProperty("--app-height", `${Math.min(h, phoneHeight)}px`);
    }

    const vv = window.visualViewport;
    if (!vv) {
      root.style.setProperty("--browser-chrome-bottom", "0px");
      return;
    }

    const chromeBottom = Math.max(
      0,
      Math.round(window.innerHeight - vv.height - vv.offsetTop),
    );
    root.style.setProperty("--browser-chrome-bottom", `${chromeBottom}px`);
  }

  sync();
  window.addEventListener("resize", sync, { passive: true });
  window.addEventListener("orientationchange", sync, { passive: true });
  window.visualViewport?.addEventListener("resize", sync, { passive: true });
  window.visualViewport?.addEventListener("scroll", sync, { passive: true });
}
