"use client";

import { useEffect, type RefObject } from "react";

/** Belt height the scale is measured against (the active card). */
const STAGE_H = 516;
/** Chrome above and below the belt that must stay clear (nav + caption). */
const CHROME_H = 320;
const MIN_SCALE = 0.56;

/**
 * Shrinks the Private World belt on wide-but-short desktops — port of the
 * prototype's `pwLandscapeScaleCap`. Without it the fixed 516px belt runs
 * under the nav on, say, 1280x700.
 *
 * Lives in JS rather than CSS because the cap is a ratio of two lengths, which
 * `calc()` cannot express: `calc((100vh - 320px) / 516)` evaluates to a length
 * and `zoom` discards it.
 */
export function useDaysScaleCap(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // The band the prototype guards: below it the layout is already stacked,
    // above it there is room to spare.
    const band = window.matchMedia(
      "(min-width: 1025px) and (max-width: 1439px) and (min-aspect-ratio: 11/10)",
    );

    const apply = () => {
      if (!band.matches) {
        el.style.removeProperty("--pw-scale");
        return;
      }
      const cap = (window.innerHeight - CHROME_H) / STAGE_H;
      el.style.setProperty(
        "--pw-scale",
        String(Math.max(MIN_SCALE, Math.min(1, cap))),
      );
    };

    apply();
    window.addEventListener("resize", apply, { passive: true });
    band.addEventListener("change", apply);
    return () => {
      window.removeEventListener("resize", apply);
      band.removeEventListener("change", apply);
      el.style.removeProperty("--pw-scale");
    };
  }, [ref]);
}
