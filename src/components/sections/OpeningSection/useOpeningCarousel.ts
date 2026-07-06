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
  OPENING_SLIDE_COUNT,
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
  const [loopIndex, setLoopIndex] = useState(OPENING_START_INDEX);
  const [slideWidth, setSlideWidth] = useState(0);
  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [loopJumping, setLoopJumping] = useState(false);
  const loopIndexRef = useRef(loopIndex);
  const pointerRef = useRef<number | null>(null);
  const startRef = useRef({ x: 0, y: 0 });
  const gestureRef = useRef({ locked: false, horizontal: false });

  const index = normalizeOpeningSlideIndex(loopIndex);
  loopIndexRef.current = loopIndex;

  useLayoutEffect(() => {
    const el = slidesRef.current;
    if (!el) return;

    const sync = () => setSlideWidth(el.clientWidth);
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [slidesRef]);

  const goTo = useCallback((nextLoopIndex: number, kind: HapticKind | false = "navigate") => {
    if (nextLoopIndex !== loopIndexRef.current && kind !== false) triggerHaptic(kind);
    setLoopIndex(nextLoopIndex);
    setDragPx(0);
    setIsDragging(false);
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
    setDragPx(dx);
  }, []);

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
        setDragPx(0);
        setIsDragging(false);
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      pointerRef.current = null;
      gestureRef.current = { locked: false, horizontal: false };
    },
    [goNext, goPrev],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest("input, textarea, select, button, a, [role='tab']")
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev]);

  const trackOffsetPx =
    slideWidth > 0 ? -(loopIndex * slideWidth) + dragPx : 0;

  const allSlides = Array.from({ length: OPENING_LOOP_COPIES }, () => openingSlides).flat();

  return {
    index,
    loopIndex,
    slide: openingSlides[index],
    allSlides,
    slideWidth,
    trackOffsetPx,
    dragPx,
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
  activeIndex: number,
  slidesRef: RefObject<HTMLElement | null>,
) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const visibleRef = useRef(true);

  useEffect(() => {
    const section = slidesRef.current?.closest("section");
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          const video = videoRefs.current[activeIndex];
          if (video) {
            const promise = video.play();
            if (promise?.catch) promise.catch(() => {});
          }
        } else {
          videoRefs.current.forEach((video) => video?.pause());
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [activeIndex, slidesRef]);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;

      if (i === activeIndex) {
        video.currentTime = 0;
        if (visibleRef.current) {
          const play = () => {
            const promise = video.play();
            if (promise?.catch) promise.catch(() => {});
          };

          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) play();
          else video.addEventListener("loadeddata", play, { once: true });
        }
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [activeIndex]);

  const setVideoRef = useCallback(
    (i: number) => (el: HTMLVideoElement | null) => {
      videoRefs.current[i] = el;
    },
    [],
  );

  return { setVideoRef };
}
