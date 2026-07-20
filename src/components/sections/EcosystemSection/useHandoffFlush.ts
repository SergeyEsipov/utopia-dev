"use client";

import { useEffect, type RefObject } from "react";

/**
 * Squares off the section's rounded top corners once it has slid flush
 * against the top of the viewport during the desktop hero handoff
 * (prototype desktop_v5 `.destinations--flush`).
 *
 * Desktop-only (≥1024), where the section overlaps the pinned hero. The
 * 0/2px hysteresis stops the class from chattering when the edge hovers
 * around 0 during slow scrolling. Toggled imperatively rather than through
 * state so scrolling never triggers a re-render.
 */
export function useHandoffFlush(
  ref: RefObject<HTMLElement | null>,
  flushClass: string,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const desktop = window.matchMedia("(min-width: 1024px)");

    let frame: number | null = null;
    let flush = false;
    let attached = false;

    const update = () => {
      frame = null;
      const { top } = el.getBoundingClientRect();
      flush = flush ? top <= 2 : top <= 0;
      el.classList.toggle(flushClass, flush);
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
      flush = false;
      el.classList.remove(flushClass);
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
  }, [ref, flushClass]);
}
