"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  OPENING_LOOP_COPIES,
  OPENING_START_INDEX,
  OPENING_TRANSITION_MS,
  normalizeOpeningLoopIndex,
  normalizeOpeningSlideIndex,
  openingSlides,
} from "@/lib/opening-carousel";
import { triggerHaptic, type HapticKind } from "@/lib/haptics";

const SWIPE_MIN_X = 28;
const SWIPE_LOCK_X = 8;
const SWIPE_LOCK_Y = 8;

export function useOpeningCarousel(
  slidesRef: RefObject<HTMLElement | null>,
) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [loopIndex, setLoopIndex] = useState(OPENING_START_INDEX);
  const [slideWidth, setSlideWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [loopJumping, setLoopJumping] = useState(false);
  const loopIndexRef = useRef(loopIndex);
  const slideWidthRef = useRef(slideWidth);
  const dragPxRef = useRef(0);
  const dragRafRef = useRef<number | null>(null);
  const pointerRef = useRef<number | null>(null);
  const startRef = useRef({ x: 0, y: 0 });
  const gestureRef = useRef({ locked: false, horizontal: false });

  const index = normalizeOpeningSlideIndex(loopIndex);
  loopIndexRef.current = loopIndex;
  slideWidthRef.current = slideWidth;

  const applyTransform = useCallback((loopIdx: number, drag: number) => {
    const track = trackRef.current;
    const width = slideWidthRef.current;
    if (!track || width <= 0) return;
    track.style.transform = `translate3d(${-(loopIdx * width) + drag}px, 0, 0)`;
  }, []);

  useLayoutEffect(() => {
    const el = slidesRef.current;
    if (!el) return;

    const sync = () => setSlideWidth(el.clientWidth);
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [slidesRef]);

  useLayoutEffect(() => {
    if (!isDragging) {
      dragPxRef.current = 0;
      applyTransform(loopIndex, 0);
    }
  }, [applyTransform, isDragging, loopIndex, slideWidth]);

  const goTo = useCallback((nextLoopIndex: number, kind: HapticKind | false = "navigate") => {
    if (nextLoopIndex !== loopIndexRef.current && kind !== false) triggerHaptic(kind);
    dragPxRef.current = 0;
    setIsDragging(false);
    setLoopIndex(nextLoopIndex);
  }, []);

  const goNext = useCallback(
    (kind: HapticKind | false = "navigate") => goTo(loopIndexRef.current + 1, kind),
    [goTo],
  );
  const goPrev = useCallback(
    (kind: HapticKind | false = "navigate") => goTo(loopIndexRef.current - 1, kind),
    [goTo],
  );

  useEffect(() => {
    if (isDragging) return;

    const normalized = normalizeOpeningLoopIndex(loopIndex);
    if (normalized === loopIndex) return;

    const timer = window.setTimeout(() => {
      setLoopJumping(true);
      setLoopIndex(normalized);
      window.requestAnimationFrame(() => {
        setLoopJumping(false);
      });
    }, OPENING_TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [isDragging, loopIndex]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    pointerRef.current = event.pointerId;
    startRef.current = { x: event.clientX, y: event.clientY };
    gestureRef.current = { locked: false, horizontal: false };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (pointerRef.current !== event.pointerId) return;

    const dx = event.clientX - startRef.current.x;
    const dy = event.clientY - startRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (!gestureRef.current.locked && (absX > SWIPE_LOCK_X || absY > SWIPE_LOCK_Y)) {
      gestureRef.current.locked = true;
      gestureRef.current.horizontal = absX > absY * 1.1;
    }

    if (!gestureRef.current.horizontal) return;

    event.preventDefault();
    dragPxRef.current = dx;
    if (dragRafRef.current !== null) return;

    dragRafRef.current = window.requestAnimationFrame(() => {
      dragRafRef.current = null;
      applyTransform(loopIndexRef.current, dragPxRef.current);
    });
  }, [applyTransform]);

  const onPointerEnd = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (pointerRef.current !== event.pointerId) return;

      const dx = event.clientX - startRef.current.x;
      const dy = event.clientY - startRef.current.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (gestureRef.current.horizontal && absX >= SWIPE_MIN_X && absX > absY) {
        if (dx < 0) goNext("success");
        else goPrev("success");
      } else {
        dragPxRef.current = 0;
        setIsDragging(false);
        applyTransform(loopIndexRef.current, 0);
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      pointerRef.current = null;
      gestureRef.current = { locked: false, horizontal: false };
    },
    [applyTransform, goNext, goPrev],
  );

  useEffect(() => {
    return () => {
      if (dragRafRef.current !== null) {
        window.cancelAnimationFrame(dragRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      const target = event.target as HTMLElement | null;
      if (
        target?.closest("input, textarea, select, button, a, [role='tab']")
      ) {
        return;
      }

      // Only claim the arrow keys while the section is actually on screen —
      // otherwise this window-level handler steals them from the rest of the page.
      const section = slidesRef.current?.closest("section");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      event.preventDefault();
      if (event.key === "ArrowLeft") goPrev();
      else goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, slidesRef]);

  // Block vertical page scroll once a horizontal swipe is locked — React's
  // onPointerMove is passive so its preventDefault is ignored, which let the
  // page scroll and cancel the swipe.
  useEffect(() => {
    const el = slidesRef.current;
    if (!el) return;
    const onTouchMove = (event: TouchEvent) => {
      if (gestureRef.current.horizontal) event.preventDefault();
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, [slidesRef]);

  const allSlides = Array.from({ length: OPENING_LOOP_COPIES }, () => openingSlides).flat();

  return {
    index,
    loopIndex,
    slide: openingSlides[index],
    allSlides,
    slideWidth,
    trackRef,
    isDragging,
    loopJumping,
    goNext,
    goPrev,
    goTo,
    swipeHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
    },
  };
}

export function useOpeningVideo(
  activeLoopIndex: number,
  slidesRef: RefObject<HTMLElement | null>,
) {
  // Indexed by loop position (one entry per rendered slide copy), NOT by
  // canonical slide index — every copy keeps its ref so an outgoing video can
  // always be paused, otherwise React nulls the detached ref and the previous
  // video keeps playing off-screen.
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const visibleRef = useRef(true);
  const reducedMotionRef = useRef(false);

  const playActive = useCallback(() => {
    if (reducedMotionRef.current || !visibleRef.current) return;
    const video = videoRefs.current[activeLoopIndex];
    if (!video) return;
    // iOS ignores preload — force the fetch, then retry play() on a timer since
    // Safari rejects muted autoplay for a not-yet-visible element (was: the clip
    // only started after a manual swipe).
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) video.load();
    let attempts = 0;
    const tryPlay = () => {
      if (videoRefs.current[activeLoopIndex] !== video || !video.paused) return;
      const promise = video.play();
      if (promise?.catch)
        promise.catch(() => {
          if (++attempts > 12) return;
          setTimeout(tryPlay, 300);
        });
    };
    tryPlay();
  }, [activeLoopIndex]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reducedMotionRef.current = mq.matches;
      if (mq.matches) videoRefs.current.forEach((video) => video?.pause());
      else playActive();
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [playActive]);

  useEffect(() => {
    const section = slidesRef.current?.closest("section");
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) playActive();
        else videoRefs.current.forEach((video) => video?.pause());
      },
      { threshold: 0.35 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [playActive, slidesRef]);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;

      if (i === activeLoopIndex) {
        video.currentTime = 0;
        playActive();
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [activeLoopIndex, playActive]);

  const setVideoRef = useCallback(
    (i: number) => (el: HTMLVideoElement | null) => {
      videoRefs.current[i] = el;
    },
    [],
  );

  return { setVideoRef };
}
