"use client";

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
  HERO_LOOP_COPIES,
  HERO_START_DESTINATION_INDEX,
  getBackgroundMixFromRawSlideIndex,
  getRawSlideIndexFromScroll,
  getScrollLeftForSlide,
  heroCarouselSlides,
  normalizeLoopSlideIndex,
  slideIndexForDestination,
  type HeroBackgroundMix,
  type HeroCarouselSlide,
} from "@/lib/hero-carousel";
import { triggerHaptic } from "@/lib/haptics";
import { HeroMobileBackground } from "./HeroMobileBackground";
import styles from "./hero-section.module.css";

const BASE_LENGTH = heroCarouselSlides.length;
const LOOP_COPIES = HERO_LOOP_COPIES;
const ALL_SLIDES = Array.from({ length: LOOP_COPIES }, () => heroCarouselSlides).flat();
const START_SLIDE =
  BASE_LENGTH + slideIndexForDestination(HERO_START_DESTINATION_INDEX);

type HeroCarouselContextValue = {
  trackRef: React.RefObject<HTMLDivElement | null>;
  centeredSlide: number;
  allSlides: HeroCarouselSlide[];
  bgMix: HeroBackgroundMix;
  ready: boolean;
  isScrolling: boolean;
};

const HeroCarouselContext = createContext<HeroCarouselContextValue | null>(null);

function useHeroCarousel() {
  const context = useContext(HeroCarouselContext);
  if (!context) {
    throw new Error("Hero carousel components must be used within HeroMobileCarouselRoot");
  }
  return context;
}

function isSameBackgroundMix(
  current: HeroBackgroundMix,
  next: HeroBackgroundMix,
) {
  return (
    current.from === next.from &&
    current.to === next.to &&
    current.blend === next.blend
  );
}

function HeroCard({
  slide,
  centered,
}: {
  slide: HeroCarouselSlide;
  centered: boolean;
}) {
  const isFeatured = centered && slide.size === "md";

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
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isScrollingRef = useRef(false);
  const userScrollRef = useRef(false);
  const prevCenteredRef = useRef(START_SLIDE);
  const [ready, setReady] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [bgMix, setBgMix] = useState<HeroBackgroundMix>(() =>
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

  const readScrollState = useCallback(
    (forceSnap = false) => {
      const metrics = getMetrics();
      if (!metrics) return null;

      const { track, paddingLeft } = metrics;
      const rawIndex = getRawSlideIndexFromScroll(
        track.scrollLeft,
        track.clientWidth,
        paddingLeft,
      );
      const nearestSlide = Math.round(rawIndex);
      const effectiveRawIndex = forceSnap ? nearestSlide : rawIndex;

      return {
        centeredSlide: nearestSlide,
        bgMix: getBackgroundMixFromRawSlideIndex(effectiveRawIndex),
      };
    },
    [getMetrics],
  );

  const applyScrollState = useCallback(
    (forceSnap = false) => {
      const state = readScrollState(forceSnap);
      if (!state) return;

      setCenteredSlide((current) =>
        current === state.centeredSlide ? current : state.centeredSlide,
      );
      setBgMix((current) =>
        isSameBackgroundMix(current, state.bgMix) ? current : state.bgMix,
      );
    },
    [readScrollState],
  );

  const normalizeLoopInner = useCallback(() => {
    const metrics = getMetrics();
    if (!metrics || loopLockRef.current) return;

    const { track, paddingLeft } = metrics;
    const rawIndex = getRawSlideIndexFromScroll(
      track.scrollLeft,
      track.clientWidth,
      paddingLeft,
    );
    const slideIndex = Math.round(rawIndex);
    const normalizedSlide = normalizeLoopSlideIndex(slideIndex, BASE_LENGTH);

    if (normalizedSlide !== slideIndex) {
      loopLockRef.current = true;
      scrollToSlide(normalizedSlide, "auto");
      loopLockRef.current = false;
      applyScrollState(true);
    }
  }, [applyScrollState, getMetrics, scrollToSlide]);

  const finishScroll = useCallback(() => {
    if (initLockRef.current) return;

    normalizeLoopInner();
    const state = readScrollState(true);
    if (state) {
      const prevKey = normalizeLoopSlideIndex(prevCenteredRef.current, BASE_LENGTH);
      const newKey = normalizeLoopSlideIndex(state.centeredSlide, BASE_LENGTH);
      if (userScrollRef.current && prevKey !== newKey) {
        triggerHaptic("navigate");
      }
      userScrollRef.current = false;
      prevCenteredRef.current = state.centeredSlide;
      setCenteredSlide((current) =>
        current === state.centeredSlide ? current : state.centeredSlide,
      );
      setBgMix((current) =>
        isSameBackgroundMix(current, state.bgMix) ? current : state.bgMix,
      );
    } else {
      applyScrollState(true);
    }
    isScrollingRef.current = false;
    setIsScrolling(false);
  }, [applyScrollState, normalizeLoopInner, readScrollState]);

  const onScrollFrame = useCallback(() => {
    if (initLockRef.current) return;

    if (!isScrollingRef.current) {
      isScrollingRef.current = true;
      setIsScrolling(true);
    }
    applyScrollState(false);
  }, [applyScrollState]);

  const onScroll = useCallback(() => {
    if (initLockRef.current) return;
    if (rafRef.current !== null) return;

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      onScrollFrame();
    });
  }, [onScrollFrame]);

  useLayoutEffect(() => {
    if (initDoneRef.current) return;

    const track = trackRef.current;
    if (!track) return;

    initLockRef.current = true;
    scrollToSlide(START_SLIDE, "auto");
    applyScrollState(true);
    prevCenteredRef.current = START_SLIDE;
    initLockRef.current = false;
    initDoneRef.current = true;
    setReady(true);
  }, [applyScrollState, scrollToSlide]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const scheduleScrollEnd = () => {
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
      scrollEndTimerRef.current = setTimeout(finishScroll, 100);
    };

    const onScrollWithFallback = () => {
      if (initLockRef.current || loopLockRef.current) return;
      userScrollRef.current = true;
      onScroll();
      scheduleScrollEnd();
    };

    const onScrollEnd = () => {
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
        scrollEndTimerRef.current = null;
      }
      finishScroll();
    };

    track.addEventListener("scroll", onScrollWithFallback, { passive: true });
    track.addEventListener("scrollend", onScrollEnd);

    return () => {
      track.removeEventListener("scroll", onScrollWithFallback);
      track.removeEventListener("scrollend", onScrollEnd);
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [finishScroll, onScroll]);

  return (
    <HeroCarouselContext.Provider
      value={{
        trackRef,
        centeredSlide,
        allSlides: ALL_SLIDES,
        bgMix,
        ready,
        isScrolling,
      }}
    >
      {children}
    </HeroCarouselContext.Provider>
  );
}

export function HeroMobileBackgroundLayer() {
  const { bgMix, ready, isScrolling } = useHeroCarousel();
  return (
    <HeroMobileBackground
      bgMix={bgMix}
      ready={ready}
      isScrolling={isScrolling}
    />
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
        <div
          key={`${slide.id}-${index}`}
          className={[
            styles.cardsSlide,
            slide.size === "sm" ? styles.cardsSlideSide : styles.cardsSlideDest,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <HeroCard slide={slide} centered={index === centeredSlide} />
        </div>
      ))}
    </div>
  );
}
