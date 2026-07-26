"use client";

import { useEffect, useRef, useState } from "react";
import { heroCarouselDestinations, type HeroBackgroundMix } from "@/lib/hero-carousel";
import { isRestingBackground } from "@/lib/hero-background";
import styles from "./hero-section.module.css";

const PLAY_RETRY_MS = 300;
const PLAY_RETRY_MAX = 10;

type HeroVideoLayerProps = {
  bgMix: HeroBackgroundMix;
  ready: boolean;
};

/**
 * Poster-first progressive enhancement for the desktop/tablet hero: the poster
 * jpg beneath renders immediately, and each destination's muted looping clip
 * fades in once it is actually playing.
 *
 * Videos are never unmounted once a destination has been visited — the
 * prototype keeps its whole set alive and hands over video → video, holding
 * the outgoing clip on screen until the incoming one can paint. Keying a
 * single <video> per destination (what this used to do) tore the element down
 * on every change, so each step flashed back to the poster and refetched the
 * clip, even when stepping back to one already watched.
 *
 * Only mounted at ≥768 without reduced motion (gated by the parent).
 */
export function HeroVideoLayer({ bgMix, ready }: HeroVideoLayerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [inView, setInView] = useState(false);
  const [everInView, setEverInView] = useState(false);
  /** Destinations whose <video> has been mounted; only ever grows. */
  const [mounted, setMounted] = useState<number[]>([]);
  /** The clip currently faded in — lags activeIndex until the new one paints. */
  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);

  const resting = isRestingBackground(bgMix);

  // Last destination the carousel settled on (render-time adjustment, see
  // react.dev "adjusting state when a prop changes").
  const [activeIndex, setActiveIndex] = useState(bgMix.from);
  if (resting && activeIndex !== bgMix.from) {
    setActiveIndex(bgMix.from);
  }

  // Browsers refuse to autoplay muted video that is off screen; observing the
  // layer also defers the (large) fetch until the hero is actually visible.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setInView(entry.isIntersecting);
          if (entry.isIntersecting) setEverInView(true);
        }
      },
      { rootMargin: "160px", threshold: 0.15 },
    );

    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  const loadStarted = ready && everInView;

  // Mount the active destination's clip the first time it is needed; mounted
  // clips stay put, so revisiting one resumes instead of refetching. Adjusted
  // during render (same pattern as activeIndex above) rather than in an
  // effect, so the <video> exists on the very first frame it is needed.
  if (loadStarted && !mounted.includes(activeIndex)) {
    setMounted([...mounted, activeIndex]);
  }

  // Play the active clip, pause the rest.
  useEffect(() => {
    if (!loadStarted) return;

    let cancelled = false;
    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const active = videoRefs.current[activeIndex] ?? null;

    videoRefs.current.forEach((video, index) => {
      if (video && index !== activeIndex && !video.paused) video.pause();
    });

    if (!active) return;

    // Belt-and-suspenders for Safari: muted autoplay needs the JS properties,
    // not just the HTML attributes.
    active.muted = true;
    active.defaultMuted = true;
    active.playsInline = true;

    const tryPlay = () => {
      if (cancelled || !active.paused) return;
      const playPromise = active.play();
      if (!playPromise) return;
      playPromise.catch(() => {
        // Safari rejects muted autoplay while the element is still effectively
        // invisible; retry on a bounded timer.
        if (cancelled || ++attempts > PLAY_RETRY_MAX) return;
        retryTimer = setTimeout(tryPlay, PLAY_RETRY_MS);
      });
    };

    // Hand over only once the incoming clip can actually paint, so the
    // outgoing one covers the gap instead of the poster flashing through.
    // `timeupdate` rather than a one-shot `playing` handler: the latter can
    // fire in the gap between mounting the element and React wiring its
    // listener, and the hand-over would then never happen for that clip.
    const reveal = () => {
      if (!cancelled) setVisibleIndex(activeIndex);
    };

    if (inView) {
      tryPlay();
      if (active.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) reveal();
      active.addEventListener("canplay", tryPlay);
      active.addEventListener("playing", reveal);
      active.addEventListener("timeupdate", reveal);
    } else if (!active.paused) {
      active.pause();
    }

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      active.removeEventListener("canplay", tryPlay);
      active.removeEventListener("playing", reveal);
      active.removeEventListener("timeupdate", reveal);
    };
  }, [loadStarted, activeIndex, inView, mounted]);

  return (
    <div ref={wrapRef} className={styles.bgVideoWrap} aria-hidden>
      {mounted.map((index) => {
        const destination = heroCarouselDestinations[index];
        if (!destination?.video) return null;

        const isActive = index === activeIndex;
        // Deliberately not gated on carousel motion: the clips now hand over
        // to each other, so hiding them mid-step would reintroduce the poster
        // flash this layer exists to avoid.
        const isVisible = index === visibleIndex && inView;

        return (
          <video
            key={destination.id}
            ref={(node) => {
              videoRefs.current[index] = node;
            }}
            className={[styles.bgVideo, isVisible ? styles.bgVideoVisible : ""]
              .filter(Boolean)
              .join(" ")}
            src={destination.video}
            poster={destination.poster}
            muted
            loop
            playsInline
            preload={isActive ? "auto" : "metadata"}
            tabIndex={-1}
          />
        );
      })}
    </div>
  );
}
