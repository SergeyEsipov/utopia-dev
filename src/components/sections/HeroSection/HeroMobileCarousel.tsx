"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "@/design-system/components";
import {
  HERO_CARD_GAP,
  HERO_CARD_WIDTH,
  HERO_START_DESTINATION_INDEX,
  getBackgroundMixFromRawSlideIndex,
  getScrollLeftForSlide,
  heroCarouselDestinations,
  heroCarouselSlides,
  slideIndexForDestination,
  type HeroCarouselSlide,
} from "@/lib/hero-carousel";
import styles from "./hero-section.module.css";

const BASE_LENGTH = heroCarouselSlides.length;
const LOOP_COPIES = 3;
const ALL_SLIDES = Array.from({ length: LOOP_COPIES }, () => heroCarouselSlides).flat();
const START_SLIDE =
  BASE_LENGTH + slideIndexForDestination(HERO_START_DESTINATION_INDEX);

type HeroCarouselContextValue = {
  trackRef: React.RefObject<HTMLDivElement | null>;
  centeredSlide: number;
  allSlides: HeroCarouselSlide[];
  bgMix: { from: number; to: number; blend: number };
  ready: boolean;
};

const HeroCarouselContext = createContext<HeroCarouselContextValue | null>(null);

function useHeroCarousel() {
  const context = useContext(HeroCarouselContext);
  if (!context) {
    throw new Error("Hero carousel components must be used within HeroMobileCarouselRoot");
  }
  return context;
}

function HeroCard({
  slide,
  centered,
}: {
  slide: HeroCarouselSlide;
  centered: boolean;
}) {
  const isFeatured = centered && slide.bgIndex !== null;

  return (
    <div
      className={[
        styles.card,
        isFeatured ? styles.cardFeatured : "",
        centered && slide.size === "md" ? styles.cardMd : styles.cardSm,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.cardCaption}>
        <span
          className={
            centered && slide.size === "md" ? styles.captionMd : styles.captionSm
          }
        >
          {slide.label}
        </span>
        <Icon name="chevron" size={12} alt="" />
      </div>
    </div>
  );
}

export function HeroMobileCarouselRoot({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const loopLockRef = useRef(false);
  const initLockRef = useRef(true);
  const initDoneRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [bgMix, setBgMix] = useState(() =>
    getBackgroundMixFromRawSlideIndex(START_SLIDE),
  );
  const [centeredSlide, setCenteredSlide] = useState(START_SLIDE);

  const getMetrics = useCallback(() => {
    const track = trackRef.current;
    if (!track) return null;

    const computed = getComputedStyle(track);
    const paddingLeft = parseFloat(computed.paddingLeft) || 0;
    const stride = HERO_CARD_WIDTH + HERO_CARD_GAP;
    const viewportCenter = track.clientWidth / 2;

    return { track, paddingLeft, stride, viewportCenter };
  }, []);

  const scrollToSlide = useCallback(
    (slideIndex: number, behavior: ScrollBehavior = "auto") => {
      const metrics = getMetrics();
      if (!metrics) return;

      const { track, paddingLeft } = metrics;
      const left = getScrollLeftForSlide(
        slideIndex,
        track.clientWidth,
        paddingLeft,
      );

      if (behavior === "auto") {
        const prev = track.style.scrollBehavior;
        track.style.scrollBehavior = "auto";
        track.scrollLeft = left;
        track.style.scrollBehavior = prev;
        return;
      }

      track.scrollTo({ left, behavior });
    },
    [getMetrics],
  );

  const normalizeLoop = useCallback(() => {
    if (initLockRef.current) return;

    const metrics = getMetrics();
    if (!metrics || loopLockRef.current) return;

    const { track, paddingLeft, stride, viewportCenter } = metrics;
    const slideCenterOffset =
      track.scrollLeft + viewportCenter - paddingLeft - HERO_CARD_WIDTH / 2;
    const slideIndex = Math.round(slideCenterOffset / stride);

    const lowerBound = BASE_LENGTH;
    const upperBound = BASE_LENGTH * 2;

    if (slideIndex < lowerBound) {
      loopLockRef.current = true;
      scrollToSlide(slideIndex + BASE_LENGTH, "auto");
      loopLockRef.current = false;
    } else if (slideIndex >= upperBound) {
      loopLockRef.current = true;
      scrollToSlide(slideIndex - BASE_LENGTH, "auto");
      loopLockRef.current = false;
    }
  }, [getMetrics, scrollToSlide]);

  const updateFromScroll = useCallback(() => {
    const metrics = getMetrics();
    if (!metrics) return;

    const { track, paddingLeft, stride, viewportCenter } = metrics;
    const slideCenterOffset =
      track.scrollLeft + viewportCenter - paddingLeft - HERO_CARD_WIDTH / 2;
    const rawIndex = slideCenterOffset / stride;
    const nearestSlide = Math.round(rawIndex);

    setCenteredSlide(nearestSlide);
    setBgMix(getBackgroundMixFromRawSlideIndex(rawIndex));
  }, [getMetrics]);

  const onScroll = useCallback(() => {
    if (initLockRef.current) return;
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      updateFromScroll();
    });
  }, [updateFromScroll]);

  useLayoutEffect(() => {
    if (initDoneRef.current) return;

    const track = trackRef.current;
    if (!track) return;

    initLockRef.current = true;
    scrollToSlide(START_SLIDE, "auto");
    updateFromScroll();
    initLockRef.current = false;
    initDoneRef.current = true;
    setReady(true);
  }, [scrollToSlide, updateFromScroll]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScrollEnd = () => {
      if (initLockRef.current) return;
      normalizeLoop();
      updateFromScroll();
    };

    track.addEventListener("scrollend", onScrollEnd);

    let scrollEndTimer: ReturnType<typeof setTimeout> | undefined;
    const onScrollWithFallback = () => {
      if (initLockRef.current) return;
      onScroll();
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(onScrollEnd, 120);
    };

    track.addEventListener("scroll", onScrollWithFallback);

    return () => {
      track.removeEventListener("scrollend", onScrollEnd);
      track.removeEventListener("scroll", onScrollWithFallback);
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [normalizeLoop, onScroll, updateFromScroll]);

  return (
    <HeroCarouselContext.Provider
      value={{
        trackRef,
        centeredSlide,
        allSlides: ALL_SLIDES,
        bgMix,
        ready,
      }}
    >
      {children}
    </HeroCarouselContext.Provider>
  );
}

export function HeroMobileBackground() {
  const { bgMix, ready } = useHeroCarousel();

  return (
    <div
      className={[styles.bgWrap, ready ? styles.bgWrapReady : ""]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      {heroCarouselDestinations.map((dest, index) => {
        let opacity = 0;
        if (index === bgMix.from) opacity = 1 - bgMix.blend;
        if (index === bgMix.to) opacity = bgMix.blend;
        if (bgMix.from === bgMix.to && index === bgMix.from) opacity = 1;

        return (
          <Image
            key={dest.id}
            src={dest.bg}
            alt=""
            fill
            priority={index <= 1}
            className={styles.bg}
            sizes="100vw"
            style={{ opacity }}
          />
        );
      })}
    </div>
  );
}

export function HeroMobileCarouselTrack() {
  const { trackRef, centeredSlide, allSlides, ready } = useHeroCarousel();

  return (
    <div
      ref={trackRef}
      className={[styles.cardsTrack, ready ? styles.cardsTrackReady : ""]
        .filter(Boolean)
        .join(" ")}
      aria-label="Destinations carousel"
    >
      {allSlides.map((slide, index) => (
        <div key={`${slide.id}-${index}`} className={styles.cardsSlide}>
          <HeroCard slide={slide} centered={index === centeredSlide} />
        </div>
      ))}
    </div>
  );
}
