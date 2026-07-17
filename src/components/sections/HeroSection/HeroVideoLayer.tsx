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
  isScrolling: boolean;
};

/**
 * Poster-first progressive enhancement for the desktop/tablet hero
 * (reference: desktop_v3/js/lazy-video.js + its hero slider): the poster jpg
 * layer beneath renders immediately; the ACTIVE destination's muted looping
 * 4K clip is lazy-loaded once the hero is on screen and fades in only when
 * it is actually playing. Only mounted at >=768 without reduced motion
 * (gated by the parent), so mobile stays on static images.
 */
export function HeroVideoLayer({ bgMix, ready, isScrolling }: HeroVideoLayerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = useState(false);
  const [everInView, setEverInView] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const resting = isRestingBackground(bgMix);

  // Last destination the carousel settled on (render-time adjustment, see
  // react.dev "adjusting state when a prop changes"); while a crossfade is in
  // flight the previous video stays mounted (hidden) so returning to the same
  // card fades straight back in without a reload.
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

  // Lazy-load: the <video> only mounts (and starts fetching) once the
  // carousel has initialised and the hero has been on screen at least once.
  const loadStarted = ready && everInView;

  // Drive playback per mounted destination (keyed remount on change).
  useEffect(() => {
    if (!loadStarted) return;

    const video = videoRef.current;
    if (!video) return;

    // Belt-and-suspenders for Safari: muted autoplay needs the JS
    // properties, not just the HTML attributes (same as desktop_v3).
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    let cancelled = false;
    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const tryPlay = () => {
      if (cancelled || !video.paused) return;
      const playPromise = video.play();
      if (!playPromise) return;
      playPromise.catch(() => {
        // Safari rejects muted autoplay while the element is still
        // effectively invisible; retry on a bounded timer (desktop_v3 trick).
        if (cancelled || ++attempts > PLAY_RETRY_MAX) return;
        retryTimer = setTimeout(tryPlay, PLAY_RETRY_MS);
      });
    };

    if (inView) {
      tryPlay();
      video.addEventListener("canplay", tryPlay);
    } else if (!video.paused) {
      video.pause();
    }

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      video.removeEventListener("canplay", tryPlay);
    };
  }, [loadStarted, activeIndex, inView]);

  const destination = heroCarouselDestinations[activeIndex];
  const showVideo =
    playingIndex === activeIndex && resting && !isScrolling && inView;

  return (
    <div ref={wrapRef} className={styles.bgVideoWrap} aria-hidden>
      {loadStarted && destination.video ? (
        <video
          key={destination.id}
          ref={videoRef}
          className={[styles.bgVideo, showVideo ? styles.bgVideoVisible : ""]
            .filter(Boolean)
            .join(" ")}
          src={destination.video}
          poster={destination.poster}
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
          onPlaying={() => setPlayingIndex(activeIndex)}
        />
      ) : null}
    </div>
  );
}
