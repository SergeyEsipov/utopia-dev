"use client";

import { useEffect, useState } from "react";

/**
 * Drives the overlay nav's transparent → solid flip (prototype desktop_v8/v9
 * `.nav--solid`): the bar floats clear over the hero and picks up its cream
 * backdrop once the section after the hero has slid up to the top of the
 * viewport. Hysteresis (0/2px, same as the prototype's destinations-edge
 * check) keeps it from flickering when a slow scroll parks on the boundary.
 *
 * Only meaningful for the overlay bar (≥1024 on the home page); elsewhere the
 * bar is always solid, so this never runs.
 */
export function useNavSolid(enabled: boolean) {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    // Nothing to observe on a bar that is always solid. No reset needed: the
    // caller ignores this value unless `enabled`, and the detach path below
    // clears it whenever the listener is torn down.
    if (!enabled) return;

    const desktop = window.matchMedia("(min-width: 1024px)");
    let frame: number | null = null;
    let isSolid = false;
    let attached = false;

    const update = () => {
      frame = null;
      const marker = document.querySelector<HTMLElement>(
        'section[aria-label="Ecosystem"]',
      );
      // No marker (other page shapes) → fall back to "past the first screen".
      const top = marker
        ? marker.getBoundingClientRect().top
        : window.innerHeight - window.scrollY;
      const next = isSolid ? top <= 2 : top <= 0;
      if (next !== isSolid) {
        isSolid = next;
        setSolid(next);
      }
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
      isSolid = false;
      setSolid(false);
    };

    const sync = () => {
      if (desktop.matches) attach();
      else detach();
    };

    sync();
    desktop.addEventListener("change", sync);

    return () => {
      desktop.removeEventListener("change", sync);
      detach();
    };
  }, [enabled]);

  return solid;
}
