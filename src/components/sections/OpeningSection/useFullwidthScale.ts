"use client";

import { useEffect, type RefObject } from "react";
import { useSiteVariant } from "@/lib/site-variant";

/** Shared between both builds. */
const FALLBACK_MIN_SCALE = 0.55;
const RADIUS_PEAK_AT = 0.18;
const RADIUS_FADE_AT = 0.76;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Scroll-driven growth of the full-width section — port of the prototype's
 * fullwidth driver. The media card enters at roughly the size of the previous
 * section's image and grows to fill the screen while its corners round out and
 * back, and the copy recedes so it appears to sit still as the card expands.
 *
 * The tuning differs between the two builds the client is choosing between
 * (see lib/site-variant): desktop_v8 ramps over half a viewport and rounds the
 * corners to 32px, desktop_v9 ramps over 1.28 viewports and keeps them square.
 *
 * Everything is written imperatively — no state, so scrolling never re-renders.
 */
export function useFullwidthScale(sectionRef: RefObject<HTMLElement | null>) {
  const { fullwidth } = useSiteVariant();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const inner = section.querySelector<HTMLElement>("[data-fullwidth-inner]");
    const card = section.querySelector<HTMLElement>("[data-fullwidth-card]");
    const content = section.querySelector<HTMLElement>(
      "[data-fullwidth-content]",
    );
    const nav = section.querySelector<HTMLElement>("[data-fullwidth-nav]");
    if (!inner || !card) return;

    const desktop = window.matchMedia("(min-width: 1024px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame: number | null = null;
    let attached = false;

    /** Fully-grown state — also what reduced motion and mobile get.
     *
     * These clear to explicit values rather than "": the ≥1024 stylesheet now
     * carries the start inset as `transform: scale(...)` on the card (the
     * prototypes' `.fullwidth__scale`), so blanking the inline style would
     * hand the card straight back to that start scale and strand it inset —
     * visible as cream bars under reduced motion. Both prototypes' own
     * reduced-motion branches write `transform: none` for the same reason. */
    const settle = () => {
      inner.style.borderRadius = "0px";
      card.style.borderRadius = "0px";
      card.style.transform = "none";
      if (content) {
        content.style.top = "";
        content.dataset.fullwidthVisible = "true";
      }
      if (nav) nav.dataset.fullwidthVisible = "true";
    };

    /**
     * Start size: the previous screen's image card, so the two line up at the
     * moment of hand-off. Falls back to a fixed ratio when it can't be read.
     */
    const minScale = () => {
      const seed = document.querySelector<HTMLElement>("[data-scale-seed]");
      const innerW = inner.clientWidth || window.innerWidth || 1;
      const seedW = seed?.getBoundingClientRect().width ?? 0;
      return Math.min(1, Math.max(FALLBACK_MIN_SCALE, seedW / innerW));
    };

    const startRadius = () => {
      const seed = document.querySelector<HTMLElement>("[data-scale-seed]");
      if (!seed) return fullwidth.startRadius;
      const r = parseFloat(getComputedStyle(seed).borderTopLeftRadius);
      return Number.isFinite(r) ? r : fullwidth.startRadius;
    };

    const radiusFor = (progress: number) => {
      const from = startRadius();
      const peak = fullwidth.peakRadius;
      if (progress <= RADIUS_PEAK_AT) {
        return from + (peak - from) * smooth(progress / RADIUS_PEAK_AT);
      }
      if (progress < RADIUS_FADE_AT) return peak;
      return (
        peak * (1 - smooth((progress - RADIUS_FADE_AT) / (1 - RADIUS_FADE_AT)))
      );
    };

    const contentTopPx = () => {
      if (!content) return 0;
      const value = parseFloat(
        getComputedStyle(content)
          .getPropertyValue("--fullwidth-content-top")
          .trim(),
      );
      return Number.isFinite(value) ? value : 0;
    };

    const update = () => {
      frame = null;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = clamp01(
        (vh - rect.top + vh * fullwidth.scaleStartOffset) /
          (vh * fullwidth.scaleDistance),
      );

      if (progress >= 1) {
        inner.style.borderRadius = "0px";
        card.style.borderRadius = "0px";
        card.style.transform = "none";
        if (content) content.style.top = "";
      } else {
        const min = minScale();
        const scale = min + (1 - min) * progress;
        const radius = `${radiusFor(progress)}px`;
        inner.style.borderRadius = radius;
        card.style.borderRadius = radius;
        card.style.transform = `scale(${scale})`;
        if (content) {
          // Hold the copy visually still while the card grows underneath it.
          const recedeY = (1 - scale) * inner.clientHeight;
          content.style.top = `${recedeY + contentTopPx() * scale}px`;
        }
      }

      if (content) {
        content.dataset.fullwidthVisible = String(
          progress >= fullwidth.contentRevealAt,
        );
      }
      if (nav) nav.dataset.fullwidthVisible = String(progress >= 1);
    };

    const requestUpdate = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(update);
    };

    const attach = () => {
      if (attached) return;
      attached = true;
      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", requestUpdate, { passive: true });
      requestUpdate();
    };

    const detach = () => {
      if (!attached) return;
      attached = false;
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      settle();
    };

    const sync = () => {
      if (desktop.matches && !reducedMotion.matches) attach();
      else detach();
    };

    sync();
    desktop.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);

    return () => {
      desktop.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
      detach();
    };
  }, [sectionRef, fullwidth]);
}
