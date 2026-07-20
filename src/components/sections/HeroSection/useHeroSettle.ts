"use client";

import { useEffect, type RefObject } from "react";

/* Progress curves, matching prototype desktop_v5's settle driver. */
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const smooth = (t: number) => t * t * (3 - 2 * t);

const REST_STATE: ReadonlyArray<readonly [string, string]> = [
  ["--hero-main-opacity", "1"],
  ["--hero-cards-opacity", "1"],
  ["--hero-retreat-y", "0vh"],
  ["--hero-media-scale", "1"],
  ["--hero-main-y", "0px"],
  ["--hero-cards-y", "0px"],
];

/**
 * Drives the desktop hero → destinations handoff (prototype desktop_v5).
 *
 * While the pin's runway scrolls past (pin height − viewport height), the
 * hero foreground fades out and the media retreats a few vh, and the
 * ecosystem section slides over the pinned hero in normal document flow.
 * Progress is written as CSS custom properties on the hero element.
 *
 * Desktop-only (≥1024) and disabled under prefers-reduced-motion; in both
 * cases the properties are left at / returned to their resting values, so
 * the hero just renders normally.
 */
export function useHeroSettle(
  pinRef: RefObject<HTMLElement | null>,
  heroRef: RefObject<HTMLElement | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;
    const pin = pinRef.current;
    const hero = heroRef.current;
    if (!pin || !hero) return;

    const desktop = window.matchMedia("(min-width: 1024px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame: number | null = null;
    let attached = false;

    const update = () => {
      frame = null;
      const vh = window.innerHeight || 1;
      const travel = Math.max(1, pin.offsetHeight - vh);
      const p = clamp01(-pin.getBoundingClientRect().top / travel);

      const mainFade = smooth(clamp01(p / 0.31));
      const cardsFade = smooth(clamp01((p - 0.08) / 0.42));
      const retreat = easeOut(p);

      hero.style.setProperty("--hero-main-opacity", (1 - mainFade).toFixed(3));
      hero.style.setProperty("--hero-cards-opacity", (1 - cardsFade).toFixed(3));
      hero.style.setProperty(
        "--hero-retreat-y",
        `${(-4.5 * retreat).toFixed(2)}vh`,
      );
      hero.style.setProperty(
        "--hero-media-scale",
        (1 + 0.018 * retreat).toFixed(4),
      );
      hero.style.setProperty("--hero-main-y", `${(-24 * mainFade).toFixed(1)}px`);
      hero.style.setProperty(
        "--hero-cards-y",
        `${(-18 * cardsFade).toFixed(1)}px`,
      );
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
      REST_STATE.forEach(([prop, value]) => hero.style.setProperty(prop, value));
    };

    const sync = () => {
      if (desktop.matches && !reduced.matches) attach();
      else detach();
    };

    sync();
    desktop.addEventListener("change", sync);
    reduced.addEventListener("change", sync);

    return () => {
      desktop.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      detach();
    };
  }, [pinRef, heroRef, active]);
}
