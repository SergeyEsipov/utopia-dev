"use client";

import { useEffect } from "react";

/**
 * Screen-by-screen scroll snapping — port of the prototype desktop_v8/v9
 * engine. One wheel notch / swipe / page key commits a run to the next screen
 * instead of free-scrolling; input is blocked for the duration and the
 * trackpad's leftover momentum is drained afterwards so it cannot immediately
 * trigger the next hop.
 *
 * Desktop-only (≥1024, matching the prototype's own `body { min-width: 1024px }`)
 * and inert under prefers-reduced-motion, where every hop lands instantly.
 */
export function useScrollSnap(selector: string) {
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    /** Timings from the prototype (identical in v8 and v9). */
    const DURATION = 660;
    const HERO_TO_DEST_DURATION = 820;
    const MOMENTUM_LULL = 260;
    const MOMENTUM_MAX = 560;
    /** Ignore sub-pixel drift around a landing point. */
    const DEADZONE = 2;

    let attached = false;
    let snapping = false;
    let draining = false;
    let raf = 0;
    let startT = 0;
    let startY = 0;
    let endY = 0;
    let currentDuration = DURATION;
    let lastTouchY = 0;
    let lastScrollY = window.scrollY;
    let lastScrollDirection = 0;
    let scrollEndTimer: ReturnType<typeof setTimeout> | null = null;
    let drainTimer: ReturnType<typeof setTimeout> | null = null;
    let drainMaxTimer: ReturnType<typeof setTimeout> | null = null;

    type Point = { el: Element; y: number };

    const screens = () => Array.from(document.querySelectorAll(selector));

    /**
     * Where the page must sit for `el` to fill the viewport. Screens shorter
     * than the viewport align to their bottom edge, as in the prototype.
     */
    const targetScroll = (el: Element) => {
      const rect = el.getBoundingClientRect();
      const pageTop = rect.top + window.scrollY;
      const viewportGap = Math.max(0, window.innerHeight - rect.height);
      return Math.round(pageTop - viewportGap);
    };

    const snapPoints = (): Point[] =>
      screens()
        .map((el) => ({ el, y: targetScroll(el) }))
        .sort((a, b) => a.y - b.y);

    // The menu owns the viewport while it is open; SiteMenu marks that on body.
    const isMenuOpen = () => document.body.classList.contains("menu-open");

    const snapTarget = (direction: number): Point | null => {
      if (isMenuOpen()) return null;
      const points = snapPoints();
      if (!points.length) return null;
      const y = window.scrollY;

      if (direction > 0) {
        if (y >= points[points.length - 1].y - DEADZONE) return null;
        return points.find((p) => p.y > y + DEADZONE) ?? null;
      }
      if (direction < 0) {
        if (y <= points[0].y + DEADZONE) return null;
        for (let i = points.length - 1; i >= 0; i -= 1) {
          if (points[i].y < y - DEADZONE) return points[i];
        }
      }
      return null;
    };

    /** After a free scroll settles, pull to the nearest screen. */
    const nearestUnsettledPoint = (): Point | null => {
      if (isMenuOpen() || lastScrollDirection === 0) return null;
      const points = snapPoints();
      if (!points.length) return null;
      const y = window.scrollY;
      // Past the last screen the page scrolls freely (footer).
      if (y > points[points.length - 1].y + DEADZONE) return null;

      const nearest = points.reduce(
        (best, p) => (Math.abs(p.y - y) < Math.abs(best.y - y) ? p : best),
        points[0],
      );
      return Math.abs(nearest.y - y) > DEADZONE ? nearest : null;
    };

    const ease = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

    const blockScrollInput = (e: Event) => e.preventDefault();

    const setInputBlocked = (blocked: boolean) => {
      if (blocked) {
        window.addEventListener("wheel", blockScrollInput, { passive: false });
        window.addEventListener("touchmove", blockScrollInput, {
          passive: false,
        });
      } else {
        window.removeEventListener("wheel", blockScrollInput);
        window.removeEventListener("touchmove", blockScrollInput);
      }
    };

    const stopDrain = () => {
      if (drainTimer) clearTimeout(drainTimer);
      if (drainMaxTimer) clearTimeout(drainMaxTimer);
      drainTimer = null;
      drainMaxTimer = null;
      draining = false;
    };

    const keepDraining = (e: Event) => {
      e.preventDefault();
      if (drainTimer) clearTimeout(drainTimer);
      drainTimer = setTimeout(stopDrain, MOMENTUM_LULL);
    };

    const startDrain = () => {
      stopDrain();
      draining = true;
      drainTimer = setTimeout(stopDrain, MOMENTUM_LULL);
      drainMaxTimer = setTimeout(stopDrain, MOMENTUM_MAX);
    };

    const finishSnap = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      window.scrollTo({ top: endY, left: 0, behavior: "instant" });
      setInputBlocked(false);
      snapping = false;
      lastScrollY = endY;
      lastScrollDirection = 0;
      startDrain();
    };

    const frame = (now: number) => {
      if (!snapping) return;
      if (!startT) startT = now;
      const p = Math.min(1, (now - startT) / currentDuration);
      window.scrollTo({
        top: startY + (endY - startY) * ease(p),
        left: 0,
        behavior: "instant",
      });
      if (p < 1) {
        raf = requestAnimationFrame(frame);
        return;
      }
      finishSnap();
    };

    const startSnap = (target: Point | null) => {
      if (snapping || isMenuOpen() || !target) return;
      stopDrain();
      snapping = true;
      startT = 0;
      startY = window.scrollY;
      endY = Math.max(0, target.y);
      // The hero → destinations hop is deliberately slower than the rest
      // (prototype `isHeroToDestSnap`).
      currentDuration =
        (target.el as HTMLElement).dataset.snapScreen === "destinations"
          ? HERO_TO_DEST_DURATION
          : DURATION;
      setInputBlocked(true);
      if (reducedMotion.matches || Math.abs(endY - startY) < 4) {
        finishSnap();
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    /** Normalise line/page wheel modes to pixels. */
    const wheelDeltaY = (e: WheelEvent) => {
      if (e.deltaMode === 1) return e.deltaY * 16;
      if (e.deltaMode === 2) return e.deltaY * window.innerHeight;
      return e.deltaY;
    };

    const onWheel = (e: WheelEvent) => {
      if (snapping) {
        e.preventDefault();
        return;
      }
      if (draining) {
        keepDraining(e);
        return;
      }
      const deltaY = wheelDeltaY(e);
      if (!deltaY) return;
      const target = snapTarget(deltaY > 0 ? 1 : -1);
      if (!target) return;
      e.preventDefault();
      startSnap(target);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length) lastTouchY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches.length) return;
      const currentY = e.touches[0].clientY;
      const deltaY = lastTouchY - currentY;
      lastTouchY = currentY;
      if (snapping) {
        e.preventDefault();
        return;
      }
      if (draining) {
        keepDraining(e);
        return;
      }
      if (!deltaY) return;
      const target = snapTarget(deltaY > 0 ? 1 : -1);
      if (!target) return;
      e.preventDefault();
      startSnap(target);
    };

    // Optional value: every other key falls through to normal handling.
    const keyDeltas: Record<string, (() => number) | undefined> = {
      " ": () => window.innerHeight * 0.85,
      PageDown: () => window.innerHeight * 0.85,
      PageUp: () => -window.innerHeight * 0.85,
      ArrowDown: () => 80,
      ArrowUp: () => -80,
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const getDelta = keyDeltas[e.key];
      if (snapping && getDelta) {
        e.preventDefault();
        return;
      }
      if (!getDelta) return;
      if (draining) {
        e.preventDefault();
        return;
      }
      // Let the carousels keep their own arrow-key handling.
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [role='tab']")) return;

      let delta = getDelta();
      if (e.key === " " && e.shiftKey) delta = -delta;
      const point = snapTarget(delta > 0 ? 1 : -1);
      if (!point) return;
      e.preventDefault();
      startSnap(point);
    };

    const onScroll = () => {
      if (snapping) return;
      const y = window.scrollY;
      if (Math.abs(y - lastScrollY) > 1) {
        lastScrollDirection = y > lastScrollY ? 1 : -1;
      }
      lastScrollY = y;
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => startSnap(nearestUnsettledPoint()), 90);
    };

    const onResize = () => {
      if (snapping) finishSnap();
    };

    const attach = () => {
      if (attached) return;
      attached = true;
      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
    };

    const detach = () => {
      if (!attached) return;
      attached = false;
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      stopDrain();
      if (snapping) finishSnap();
      setInputBlocked(false);
    };

    const sync = () => (desktop.matches ? attach() : detach());

    sync();
    desktop.addEventListener("change", sync);

    return () => {
      desktop.removeEventListener("change", sync);
      detach();
    };
  }, [selector]);
}
