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
  rawScrollIndex: number;
  allSlides: HeroCarouselSlide[];
  bgMix: HeroBackgroundMix;
  ready: boolean;
  isScrolling: boolean;
  scrollToSlide: (slideIndex: number, behavior?: ScrollBehavior) => void;
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

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getCardFocus(rawIndex: number, slideIndex: number) {
  return clamp01(1 - Math.abs(rawIndex - slideIndex));
}

function HeroCard({
  slide,
  focus,
  isScrolling,
}: {
  slide: HeroCarouselSlide;
  focus: number;
  isScrolling: boolean;
}) {
  const isFeatured = focus > 0.92;

  return (
    <div
      className={[
        styles.card,
        styles.cardAnimated,
        isFeatured ? styles.cardFeatured : "",
        focus > 0.5 ? styles.cardMd : styles.cardSm,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--card-focus": focus,
          "--card-transition": isScrolling ? "none" : undefined,
        } as React.CSSProperties
      }
    >
      <div className={styles.cardCaption}>
        <span className={focus > 0.5 ? styles.captionMd : styles.captionSm}>
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
  const [rawScrollIndex, setRawScrollIndex] = useState(START_SLIDE);

  const getMetrics = useCallback(() => {
    const track = trackRef.current;
    if (!track) return null;

    const computed = getComputedStyle(track);
    const paddingLeft = parseFloat(computed.paddingLeft) || 0;
    const gap = parseFloat(computed.gap) || HERO_CARD_GAP;
    const slide = track.querySelector<HTMLElement>(`.${styles.cardsSlide}`);
    const cardWidth = slide?.offsetWidth ?? HERO_CARD_WIDTH;
    const stride = cardWidth + gap;
    const viewportCenter = track.clientWidth / 2;

    return { track, paddingLeft, stride, cardWidth, viewportCenter };
  }, []);

  const scrollToSlide = useCallback(
    (slideIndex: number, behavior: ScrollBehavior = "auto") => {
      const metrics = getMetrics();
      if (!metrics) return;

      const { track, paddingLeft, stride, cardWidth } = metrics;
      const left = getScrollLeftForSlide(
        slideIndex,
        track.clientWidth,
        paddingLeft,
        stride,
        cardWidth,
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

      const { track, paddingLeft, stride, cardWidth } = metrics;
      const rawIndex = getRawSlideIndexFromScroll(
        track.scrollLeft,
        track.clientWidth,
        paddingLeft,
        stride,
        cardWidth,
      );
      const nearestSlide = Math.round(rawIndex);
      const effectiveRawIndex = forceSnap ? nearestSlide : rawIndex;

      return {
        centeredSlide: nearestSlide,
        rawScrollIndex: effectiveRawIndex,
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
      setRawScrollIndex(state.rawScrollIndex);
      setBgMix((current) =>
        isSameBackgroundMix(current, state.bgMix) ? current : state.bgMix,
      );
    },
    [readScrollState],
  );

  const normalizeLoopInner = useCallback(() => {
    const metrics = getMetrics();
    if (!metrics || loopLockRef.current) return;

    const { track, paddingLeft, stride, cardWidth } = metrics;
    const rawIndex = getRawSlideIndexFromScroll(
      track.scrollLeft,
      track.clientWidth,
      paddingLeft,
      stride,
      cardWidth,
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
      setRawScrollIndex(state.rawScrollIndex);
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

    let touchStartX = 0;
    let touchStartY = 0;
    let touchAxis: "x" | "y" | null = null;

    const resetTouchAxis = () => {
      touchAxis = null;
      track.style.overflowX = "";
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      touchAxis = null;
      track.style.overflowX = "";
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1 || touchAxis) return;

      const dx = event.touches[0].clientX - touchStartX;
      const dy = event.touches[0].clientY - touchStartY;
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

      touchAxis = Math.abs(dy) > Math.abs(dx) ? "y" : "x";
      if (touchAxis === "y") {
        track.style.overflowX = "hidden";
      }
    };

    track.addEventListener("scroll", onScrollWithFallback, { passive: true });
    track.addEventListener("scrollend", onScrollEnd);
    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchmove", onTouchMove, { passive: true });
    track.addEventListener("touchend", resetTouchAxis, { passive: true });
    track.addEventListener("touchcancel", resetTouchAxis, { passive: true });

    return () => {
      track.removeEventListener("scroll", onScrollWithFallback);
      track.removeEventListener("scrollend", onScrollEnd);
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchmove", onTouchMove);
      track.removeEventListener("touchend", resetTouchAxis);
      track.removeEventListener("touchcancel", resetTouchAxis);
      resetTouchAxis();
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
        rawScrollIndex,
        allSlides: ALL_SLIDES,
        bgMix,
        ready,
        isScrolling,
        scrollToSlide,
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
  const { trackRef, centeredSlide, rawScrollIndex, allSlides, ready, isScrolling, scrollToSlide } =
    useHeroCarousel();

  const handleSlideClick = useCallback(
    (index: number) => {
      if (index === centeredSlide) return;
      scrollToSlide(index, "smooth");
    },
    [centeredSlide, scrollToSlide],
  );

  const handleSlideKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (index === centeredSlide) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      scrollToSlide(index, "smooth");
    },
    [centeredSlide, scrollToSlide],
  );

  return (
    <div
      ref={trackRef}
      className={[
        styles.cardsTrack,
        ready ? styles.cardsTrackReady : "",
        isScrolling ? styles.cardsTrackScrolling : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Destinations carousel"
    >
      {allSlides.map((slide, index) => {
        const centered = index === centeredSlide;
        const focus = getCardFocus(rawScrollIndex, index);

        return (
          <div
            key={`${slide.id}-${index}`}
            className={[
              styles.cardsSlide,
              styles.cardsSlideDest,
              !centered ? styles.cardsSlideClickable : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={centered ? undefined : () => handleSlideClick(index)}
            onKeyDown={
              centered ? undefined : (event) => handleSlideKeyDown(event, index)
            }
            role={centered ? undefined : "button"}
            tabIndex={centered ? undefined : 0}
            aria-label={
              centered ? undefined : `Go to ${slide.label.replace(" >", "")}`
            }
          >
            <HeroCard slide={slide} focus={focus} isScrolling={isScrolling} />
          </div>
        );
      })}
    </div>
  );
}
