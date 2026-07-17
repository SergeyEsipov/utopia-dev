"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Icon } from "@/design-system/components";
import {
  HERO_CARD_GAP,
  HERO_CARD_GAP_DESKTOP,
  HERO_CARD_SLOT_DESKTOP,
  HERO_CARD_WIDTH,
  HERO_DESKTOP_BREAKPOINT_PX,
  HERO_LOOP_COPIES,
  HERO_START_DESTINATION_INDEX,
  getBackgroundMixFromRawSlideIndex,
  getRawSlideIndexFromScroll,
  getRawSlideIndexFromSlideNodes,
  getScrollLeftForSlide,
  getScrollLeftForSlideNode,
  heroCarouselSlides,
  normalizeLoopSlideIndex,
  slideIndexForDestination,
  type HeroBackgroundMix,
  type HeroCarouselSlide,
} from "@/lib/hero-carousel";
import { triggerHaptic } from "@/lib/haptics";
import { HeroMobileBackground } from "./HeroMobileBackground";
import { useHeroReducedMotion } from "./useHeroMediaQuery";
import styles from "./hero-section.module.css";

const BASE_LENGTH = heroCarouselSlides.length;
const LOOP_COPIES = HERO_LOOP_COPIES;
const ALL_SLIDES = Array.from({ length: LOOP_COPIES }, () => heroCarouselSlides).flat();
const START_SLIDE =
  BASE_LENGTH + slideIndexForDestination(HERO_START_DESTINATION_INDEX);
const PROGRAMMATIC_SCROLL_MIN_MS = 420;
const PROGRAMMATIC_SCROLL_MAX_MS = 760;
const PROGRAMMATIC_SCROLL_MS_PER_PX = 0.85;

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

function isDesktopHeroLayout() {
  return window.matchMedia(`(min-width: ${HERO_DESKTOP_BREAKPOINT_PX}px)`).matches;
}

function getTrackSlideElements(track: HTMLElement) {
  return Array.from(track.children).filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  );
}

function getCardFocus(rawIndex: number, slideIndex: number) {
  return clamp01(1 - Math.abs(rawIndex - slideIndex));
}

function getCardSide(rawIndex: number, slideIndex: number) {
  const delta = slideIndex - rawIndex;
  const distance = Math.abs(delta);
  if (distance < 0.001) return 0;
  const sign = delta < 0 ? -1 : 1;
  /* CSS translates side cards by --card-side * (--card-focus - 1) *
     --hero-side-shift, where one shift is half the slot-vs-side-card width
     difference. Cards beyond the immediate neighbour must also absorb the
     full width difference of each slot in between, so the multiplier grows
     1, 3, … with slot distance (keeps the 1920 five-card layout's 40px
     gaps — Figma 1:1686 — with ~74px edge peeks). Continuous at
     distance = 1 because focus is 0 from there on. Capped at distance 2:
     farther cards sit outside every viewport tier, and an uncapped shift
     could stack distant loop copies over visible cards if the track is
     scrolled without the scroll-state handlers running (e.g. scrollIntoView
     from focus handling). */
  return distance <= 1 ? sign : sign * (2 * Math.min(distance, 2) - 1);
}

function easeProgrammaticScroll(t: number) {
  const x = clamp01(t);
  return 1 - (1 - x) ** 3;
}

function HeroCard({
  slide,
  focus,
  side,
  isScrolling,
}: {
  slide: HeroCarouselSlide;
  focus: number;
  side: number;
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
          /* translateX shift is computed in CSS from --card-side/--card-focus
             so the 1920 tier can use its own side-card offset */
          "--card-side": side,
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
  const programmaticScrollRafRef = useRef<number | null>(null);
  const releaseScrollLinkedRafRef = useRef<number | null>(null);
  const resizeRafRef = useRef<number | null>(null);
  const loopLockRef = useRef(false);
  const resizeLockRef = useRef(false);
  const initLockRef = useRef(true);
  const initDoneRef = useRef(false);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isScrollingRef = useRef(false);
  const userScrollIntentRef = useRef(false);
  const userScrollRef = useRef(false);
  const prevCenteredRef = useRef(START_SLIDE);
  const centeredSlideRef = useRef(START_SLIDE);
  const stableSlideRef = useRef(START_SLIDE);
  const [ready, setReady] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [bgMix, setBgMix] = useState<HeroBackgroundMix>(() =>
    getBackgroundMixFromRawSlideIndex(START_SLIDE),
  );
  const [centeredSlide, setCenteredSlide] = useState(START_SLIDE);
  const [rawScrollIndex, setRawScrollIndex] = useState(START_SLIDE);
  const [inView, setInView] = useState(false);
  const reducedMotion = useHeroReducedMotion();

  const getMetrics = useCallback(() => {
    const track = trackRef.current;
    if (!track) return null;

    const computed = getComputedStyle(track);
    const paddingLeft = parseFloat(computed.paddingLeft) || 0;
    const isDesktop = isDesktopHeroLayout();
    const slide = track.querySelector<HTMLElement>(`.${styles.cardsSlide}`);
    const cardWidth = isDesktop
      ? HERO_CARD_SLOT_DESKTOP
      : slide?.offsetWidth ?? HERO_CARD_WIDTH;
    const gap = isDesktop
      ? HERO_CARD_GAP_DESKTOP
      : parseFloat(computed.gap) || HERO_CARD_GAP;
    const stride = cardWidth + gap;
    const viewportCenter = track.clientWidth / 2;
    const slideElements = getTrackSlideElements(track);
    const slideOffsets = slideElements.map((element) => ({
      offsetLeft: element.offsetLeft,
      offsetWidth: element.offsetWidth,
      centerX: element.offsetLeft + element.offsetWidth / 2,
    }));

    return {
      track,
      paddingLeft,
      stride,
      cardWidth,
      viewportCenter,
      isDesktop,
      slideElements,
      slideOffsets,
    };
  }, []);

  const resolveScrollLeft = useCallback(
    (slideIndex: number, metrics: NonNullable<ReturnType<typeof getMetrics>>) => {
      const { track, paddingLeft, stride, cardWidth, isDesktop, slideElements } =
        metrics;
      const slideElement = slideElements[slideIndex];

      if (isDesktop && slideElement) {
        return getScrollLeftForSlideNode(track, slideElement);
      }

      return getScrollLeftForSlide(
        slideIndex,
        track.clientWidth,
        paddingLeft,
        stride,
        cardWidth,
      );
    },
    [],
  );

  const resolveRawScrollIndex = useCallback(
    (metrics: NonNullable<ReturnType<typeof getMetrics>>) => {
      const { track, paddingLeft, stride, cardWidth, isDesktop, slideElements } =
        metrics;

      if (isDesktop) {
        return getRawSlideIndexFromSlideNodes(track, slideElements);
      }

      return getRawSlideIndexFromScroll(
        track.scrollLeft,
        track.clientWidth,
        paddingLeft,
        stride,
        cardWidth,
      );
    },
    [],
  );

  const setTrackScrollLinked = useCallback((active: boolean, programmatic = false) => {
    if (releaseScrollLinkedRafRef.current !== null) {
      window.cancelAnimationFrame(releaseScrollLinkedRafRef.current);
      releaseScrollLinkedRafRef.current = null;
    }

    const track = trackRef.current;
    if (!track) return;

    if (active) {
      track.classList.add(styles.cardsTrackScrolling);
      if (programmatic) {
        track.dataset.programmaticScroll = "true";
      }
      return;
    }

    releaseScrollLinkedRafRef.current = window.requestAnimationFrame(() => {
      releaseScrollLinkedRafRef.current = window.requestAnimationFrame(() => {
        track.classList.remove(styles.cardsTrackScrolling);
        delete track.dataset.programmaticScroll;
        releaseScrollLinkedRafRef.current = null;
      });
    });
  }, []);

  const beginInteractiveScroll = useCallback((programmatic = false) => {
    setTrackScrollLinked(true, programmatic);
    userScrollIntentRef.current = true;
    userScrollRef.current = true;
    if (!isScrollingRef.current) {
      isScrollingRef.current = true;
      setIsScrolling(true);
    }
  }, [setTrackScrollLinked]);

  const cancelProgrammaticScroll = useCallback(() => {
    if (programmaticScrollRafRef.current !== null) {
      window.cancelAnimationFrame(programmaticScrollRafRef.current);
      programmaticScrollRafRef.current = null;
    }
  }, []);

  const scrollToSlide = useCallback(
    (slideIndex: number, behavior: ScrollBehavior = "auto") => {
      const metrics = getMetrics();
      if (!metrics) return;

      const { track } = metrics;
      const left = resolveScrollLeft(slideIndex, metrics);
      stableSlideRef.current = slideIndex;

      cancelProgrammaticScroll();

      if (behavior === "auto") {
        const prev = track.style.scrollBehavior;
        track.style.scrollBehavior = "auto";
        track.scrollLeft = left;
        track.style.scrollBehavior = prev;
        return;
      }

      const startLeft = track.scrollLeft;
      const distance = left - startLeft;

      // If the target is already the current position no scroll events fire, and
      // the interactive-scroll state is only ever cleared from those events —
      // so snap and bail out rather than latching isScrolling on forever.
      if (Math.abs(distance) < 1) {
        track.scrollLeft = left;
        return;
      }

      beginInteractiveScroll(true);

      const duration = Math.min(
        PROGRAMMATIC_SCROLL_MAX_MS,
        Math.max(
          PROGRAMMATIC_SCROLL_MIN_MS,
          Math.abs(distance) * PROGRAMMATIC_SCROLL_MS_PER_PX,
        ),
      );
      const startTime = performance.now();

      const animate = (now: number) => {
        const progress = easeProgrammaticScroll((now - startTime) / duration);
        track.scrollLeft = startLeft + distance * progress;

        if (progress < 1) {
          programmaticScrollRafRef.current =
            window.requestAnimationFrame(animate);
          return;
        }

        programmaticScrollRafRef.current = null;
        track.scrollLeft = left;
      };

      programmaticScrollRafRef.current = window.requestAnimationFrame(animate);
    },
    [
      beginInteractiveScroll,
      cancelProgrammaticScroll,
      getMetrics,
      resolveScrollLeft,
    ],
  );

  const readScrollState = useCallback(
    (forceSnap = false) => {
      const metrics = getMetrics();
      if (!metrics) return null;

      const rawIndex = resolveRawScrollIndex(metrics);
      const nearestSlide = Math.round(rawIndex);
      const effectiveRawIndex = forceSnap ? nearestSlide : rawIndex;

      return {
        centeredSlide: nearestSlide,
        rawScrollIndex: effectiveRawIndex,
        bgMix: getBackgroundMixFromRawSlideIndex(effectiveRawIndex),
      };
    },
    [getMetrics, resolveRawScrollIndex],
  );

  const applyScrollState = useCallback(
    (forceSnap = false) => {
      const state = readScrollState(forceSnap);
      if (!state) return;

      setCenteredSlide((current) =>
        current === state.centeredSlide ? current : state.centeredSlide,
      );
      centeredSlideRef.current = state.centeredSlide;
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

    const rawIndex = resolveRawScrollIndex(metrics);
    const slideIndex = Math.round(rawIndex);
    const normalizedSlide = normalizeLoopSlideIndex(slideIndex, BASE_LENGTH);

    if (normalizedSlide !== slideIndex) {
      loopLockRef.current = true;
      scrollToSlide(normalizedSlide, "auto");
      loopLockRef.current = false;
      applyScrollState(true);
    }
  }, [applyScrollState, getMetrics, resolveRawScrollIndex, scrollToSlide]);

  const finishScroll = useCallback(() => {
    if (initLockRef.current) return;

    normalizeLoopInner();
    const state = readScrollState(true);
    if (state) {
      scrollToSlide(state.centeredSlide, "auto");
      const snapped = readScrollState(true);
      const resolved = snapped ?? state;
      const prevKey = normalizeLoopSlideIndex(prevCenteredRef.current, BASE_LENGTH);
      const newKey = normalizeLoopSlideIndex(resolved.centeredSlide, BASE_LENGTH);
      if (userScrollRef.current && prevKey !== newKey) {
        triggerHaptic("navigate");
      }
      userScrollRef.current = false;
      userScrollIntentRef.current = false;
      prevCenteredRef.current = resolved.centeredSlide;
      stableSlideRef.current = resolved.centeredSlide;
      setCenteredSlide((current) =>
        current === resolved.centeredSlide ? current : resolved.centeredSlide,
      );
      centeredSlideRef.current = resolved.centeredSlide;
      setRawScrollIndex(resolved.rawScrollIndex);
      setBgMix((current) =>
        isSameBackgroundMix(current, resolved.bgMix) ? current : resolved.bgMix,
      );
    } else {
      applyScrollState(true);
    }
    userScrollIntentRef.current = false;
    isScrollingRef.current = false;
    setTrackScrollLinked(false);
    setIsScrolling(false);
  }, [
    applyScrollState,
    normalizeLoopInner,
    readScrollState,
    scrollToSlide,
    setTrackScrollLinked,
  ]);

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

    const init = () => {
      scrollToSlide(START_SLIDE, "auto");
      applyScrollState(true);
      prevCenteredRef.current = START_SLIDE;
      centeredSlideRef.current = START_SLIDE;
      stableSlideRef.current = START_SLIDE;
      initLockRef.current = false;
      initDoneRef.current = true;
      setReady(true);
      requestAnimationFrame(() => {
        scrollToSlide(START_SLIDE, "auto");
        applyScrollState(true);
      });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(init);
    });
  }, [applyScrollState, scrollToSlide]);

  useEffect(() => {
    if (!ready) return;

    const track = trackRef.current;
    if (!track) return;

    const syncScroll = () => {
      if (
        isScrollingRef.current ||
        userScrollIntentRef.current ||
        programmaticScrollRafRef.current !== null
      ) {
        return;
      }

      resizeLockRef.current = true;

      if (resizeRafRef.current !== null) {
        window.cancelAnimationFrame(resizeRafRef.current);
      }

      resizeRafRef.current = window.requestAnimationFrame(() => {
        resizeRafRef.current = null;
        scrollToSlide(stableSlideRef.current, "auto");
        applyScrollState(true);
        resizeLockRef.current = false;
      });
    };

    const observer = new ResizeObserver(syncScroll);
    observer.observe(track);
    window.addEventListener("resize", syncScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncScroll);
      if (resizeRafRef.current !== null) {
        window.cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
      resizeLockRef.current = false;
    };
  }, [ready, scrollToSlide, applyScrollState]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const scheduleScrollEnd = () => {
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
      scrollEndTimerRef.current = setTimeout(() => {
        if (programmaticScrollRafRef.current !== null) {
          scheduleScrollEnd();
          return;
        }

        finishScroll();
      }, 100);
    };

    const onScrollWithFallback = () => {
      if (initLockRef.current || loopLockRef.current || resizeLockRef.current) {
        return;
      }
      if (!userScrollIntentRef.current && !isScrollingRef.current) {
        return;
      }
      userScrollRef.current = true;
      onScroll();
      scheduleScrollEnd();
    };

    const onScrollEnd = () => {
      if (programmaticScrollRafRef.current !== null) {
        return;
      }

      if (
        initLockRef.current ||
        loopLockRef.current ||
        resizeLockRef.current ||
        (!userScrollIntentRef.current && !isScrollingRef.current)
      ) {
        return;
      }
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
        scrollEndTimerRef.current = null;
      }
      finishScroll();
    };

    const markUserScrollIntent = () => {
      userScrollIntentRef.current = true;
      setTrackScrollLinked(true);
    };

    const clearIdleIntent = () => {
      if (isScrollingRef.current) return;
      userScrollIntentRef.current = false;
      setTrackScrollLinked(false);
    };

    track.addEventListener("scroll", onScrollWithFallback, { passive: true });
    track.addEventListener("scrollend", onScrollEnd);
    track.addEventListener("pointerdown", markUserScrollIntent, { passive: true });
    track.addEventListener("touchstart", markUserScrollIntent, { passive: true });
    track.addEventListener("wheel", markUserScrollIntent, { passive: true });
    track.addEventListener("pointerup", clearIdleIntent, { passive: true });
    track.addEventListener("pointercancel", clearIdleIntent, { passive: true });
    track.addEventListener("touchend", clearIdleIntent, { passive: true });
    track.addEventListener("touchcancel", clearIdleIntent, { passive: true });

    return () => {
      track.removeEventListener("scroll", onScrollWithFallback);
      track.removeEventListener("scrollend", onScrollEnd);
      track.removeEventListener("pointerdown", markUserScrollIntent);
      track.removeEventListener("touchstart", markUserScrollIntent);
      track.removeEventListener("wheel", markUserScrollIntent);
      track.removeEventListener("pointerup", clearIdleIntent);
      track.removeEventListener("pointercancel", clearIdleIntent);
      track.removeEventListener("touchend", clearIdleIntent);
      track.removeEventListener("touchcancel", clearIdleIntent);
      cancelProgrammaticScroll();
      setTrackScrollLinked(false);
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (releaseScrollLinkedRafRef.current !== null) {
        window.cancelAnimationFrame(releaseScrollLinkedRafRef.current);
        releaseScrollLinkedRafRef.current = null;
      }
    };
  }, [cancelProgrammaticScroll, finishScroll, onScroll, setTrackScrollLinked]);

  useEffect(() => {
    const section = trackRef.current?.closest("section");
    if (!section || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Autoplay — matches the prototype hero (desktop_v3 4s). The effect depends
  // on `centeredSlide`, so the timer is REBASED on every slide change (manual
  // or auto) instead of firing on a fixed cadence — otherwise a manual switch
  // right before the tick would advance again almost immediately (bug #4).
  // Skipped while scrolling; paused off-screen / under reduced motion.
  useEffect(() => {
    if (!ready || !inView || reducedMotion || isScrolling) return;
    const interval = isDesktopHeroLayout() ? 4000 : 4500;
    const timer = setTimeout(() => {
      if (!userScrollIntentRef.current && !isScrollingRef.current) {
        scrollToSlide(centeredSlideRef.current + 1, "smooth");
      }
    }, interval);
    return () => clearTimeout(timer);
  }, [ready, inView, reducedMotion, isScrolling, centeredSlide, scrollToSlide]);

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

  // Set true while a mouse drag is in progress so the click that fires on
  // mouseup does not also trigger a card/track step (bug #2).
  const draggedRef = useRef(false);

  // Mouse drag-to-scroll for desktop (touch already scrolls natively). Free-
  // scrolls the snap track during the drag, then restores snap on release so
  // the browser + existing scroll handlers settle on the nearest card.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let dragging = false;
    let startX = 0;
    let startScroll = 0;

    const onDown = (event: globalThis.MouseEvent) => {
      if (event.button !== 0) return;
      dragging = true;
      draggedRef.current = false;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      track.style.scrollSnapType = "none";
      track.style.cursor = "grabbing";
    };
    const onMove = (event: globalThis.MouseEvent) => {
      if (!dragging) return;
      const dx = event.clientX - startX;
      if (Math.abs(dx) > 3) draggedRef.current = true;
      track.scrollLeft = startScroll - dx;
      event.preventDefault();
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      track.style.scrollSnapType = "";
      track.style.cursor = "";
    };

    track.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      track.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [trackRef]);

  const handleSlideClick = useCallback(
    (index: number, event?: MouseEvent) => {
      event?.stopPropagation();
      if (draggedRef.current) {
        draggedRef.current = false;
        return;
      }
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

  const handleTrackClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (draggedRef.current) {
        draggedRef.current = false;
        return;
      }
      if (event.target !== event.currentTarget || !isDesktopHeroLayout()) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const isPrevSide = event.clientX < rect.left + rect.width / 2;
      scrollToSlide(centeredSlide + (isPrevSide ? -1 : 1), "smooth");
    },
    [centeredSlide, scrollToSlide],
  );

  return (
    <div className={styles.cardsWrap}>
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
        onClick={handleTrackClick}
      >
        {allSlides.map((slide, index) => {
          const centered = index === centeredSlide;
          const focus = getCardFocus(rawScrollIndex, index);
          const side = getCardSide(rawScrollIndex, index);

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
              onClick={
                centered ? undefined : (event) => handleSlideClick(index, event)
              }
              onKeyDown={
                centered ? undefined : (event) => handleSlideKeyDown(event, index)
              }
              role={centered ? undefined : "button"}
              tabIndex={centered ? undefined : 0}
              aria-label={
                centered ? undefined : `Go to ${slide.label.replace(" >", "")}`
              }
            >
              <HeroCard
                slide={slide}
                focus={focus}
                side={side}
                isScrolling={isScrolling}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
