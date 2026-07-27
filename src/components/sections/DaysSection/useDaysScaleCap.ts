"use client";

import { useEffect, type RefObject } from "react";
import { daysDesktopLayout } from "@/lib/days-carousel";

/** Belt height the scale is measured against (the active card). */
const STAGE_H = 516;
/** Chrome above and below the belt that must stay clear (nav + caption). */
const CHROME_H = 320;
const MIN_SCALE = 0.56;

/**
 * Shrinks the Private World belt on wide-but-short desktops — port of the
 * prototype's `pwLandscapeScaleCap` (desktop_v9 `index.html`), which takes the
 * **smaller of two caps**:
 *
 * - a *height* cap, `(vh - 320) / 516`, so the fixed 516px belt does not run
 *   under the nav on, say, 1280x700;
 * - a *width* cap, so the active card stays centred on the screen. This half
 *   was missing here, which is why the card sat 80px right of centre at 1280
 *   on a tall window while the prototype centres it at every width.
 *
 * The width cap is solved against *our* geometry rather than copied from the
 * prototype's constants: our title column is 387 (Figma 24.07) where theirs is
 * 367, so their literal `((vw/2 - 120 - 367 - 20) * 2) / 386` would centre
 * their card, not ours. Below the point where the belt alone cannot reach the
 * centre the title shrinks too (`--pw-title-scale`, floored at 28/36 exactly
 * as the prototype floors it), so the equation has two branches.
 *
 * Lives in JS rather than CSS because the cap is a ratio of two lengths, which
 * `calc()` cannot express: `calc((100vh - 320px) / 516)` evaluates to a length
 * and `zoom` discards it.
 */
export function useDaysScaleCap(
  ref: RefObject<HTMLElement | null>,
  activeCardWidth: number,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // The band the prototype guards, matched to *our* grid rather than copied:
    // the prototype starts at 1025 and gates on `min-aspect-ratio: 11/10`
    // because below either bound its layout has already stacked the title above
    // the belt. Ours never stacks above 1024 (`days-section.module.css` puts
    // them side by side from there at any aspect), so the belt needs the cap
    // over the whole 1024-1439 range. Above it the 1440 column is centred,
    // which centres the card for free.
    const band = window.matchMedia(
      "(min-width: 1024px) and (max-width: 1439px)",
    );

    const apply = () => {
      if (!band.matches) {
        el.style.removeProperty("--pw-scale");
        el.style.removeProperty("--pw-title-scale");
        el.style.removeProperty("--pw-shift");
        return;
      }

      const { titleColumn, columnGap, minTitleScale } = daysDesktopLayout;
      const half = activeCardWidth / 2;
      const vw = document.documentElement.clientWidth;
      const centre = vw / 2;
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      // Everything left of the title column: the page column's own offset plus
      // the section's (viewport-driven) padding, plus the grid gap after it.
      const inset = el.getBoundingClientRect().left + pad + columnGap;

      let widthCap: number;
      if (vw >= 1240) {
        // Solve `inset + titleColumn * titleScale(s) + activeW * s / 2 = centre`
        // for s, with titleScale(s) = max(minTitleScale, s).
        let s = (centre - inset) / (titleColumn + half);
        if (s < minTitleScale) {
          s = (centre - inset - titleColumn * minTitleScale) / half;
        }
        widthCap = Math.max(0.82, Math.min(1, s));
      } else {
        // Narrow desktops: the belt cannot reach the centre without going
        // smaller than the mobile card, so the prototype stops solving and
        // just shrinks the whole composition — `min(1, (vw - pad) / 1320)`,
        // which lands the card within ~40px of centre down to 1024.
        widthCap = Math.min(1, (vw - pad) / 1320);
      }

      const heightCap = (window.innerHeight - CHROME_H) / STAGE_H;
      const scale = Math.max(MIN_SCALE, Math.min(1, widthCap, heightCap));

      el.style.setProperty("--pw-scale", String(scale));
      // The title is a *layout* device: it sizes the room the belt gets, so it
      // follows the width cap alone. Letting the height cap drive it too (the
      // first cut of this) dragged the belt 75px left of centre on a short
      // window, because the title shrank under the belt's own shrink.
      el.style.setProperty(
        "--pw-title-scale",
        String(Math.max(minTitleScale, widthCap)),
      );
      // Whatever the height cap takes off the belt is given back as offset, so
      // the card keeps the centre it was solved for at any viewport height.
      el.style.setProperty("--pw-shift", `${(widthCap - scale) * half}px`);
    };

    apply();
    window.addEventListener("resize", apply, { passive: true });
    band.addEventListener("change", apply);
    return () => {
      window.removeEventListener("resize", apply);
      band.removeEventListener("change", apply);
      el.style.removeProperty("--pw-scale");
    };
  }, [ref, activeCardWidth]);
}
