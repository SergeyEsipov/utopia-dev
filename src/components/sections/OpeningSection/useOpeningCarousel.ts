"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OPENING_SLIDE_COUNT, openingSlides } from "@/lib/opening-carousel";

const SWIPE_MIN_X = 28;
const SWIPE_LOCK_X = 8;
const SWIPE_LOCK_Y = 8;
const EDGE_RESISTANCE = 0.32;

export function useOpeningCarousel() {
  const [index, setIndex] = useState(0);
  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const indexRef = useRef(index);
  const pointerRef = useRef<number | null>(null);
  const startRef = useRef({ x: 0, y: 0 });
  const gestureRef = useRef({ locked: false, horizontal: false });

  indexRef.current = index;

  const goTo = useCallback((nextIndex: number) => {
    const wrapped =
      ((nextIndex % OPENING_SLIDE_COUNT) + OPENING_SLIDE_COUNT) %
      OPENING_SLIDE_COUNT;
    setIndex(wrapped);
    setDragPx(0);
    setIsDragging(false);
  }, []);

  const goNext = useCallback(() => goTo(indexRef.current + 1), [goTo]);
  const goPrev = useCallback(() => goTo(indexRef.current - 1), [goTo]);

  const applyDrag = useCallback((dx: number) => {
    const current = indexRef.current;
    if (current === 0 && dx > 0) {
      setDragPx(dx * EDGE_RESISTANCE);
      return;
    }
    if (current === OPENING_SLIDE_COUNT - 1 && dx < 0) {
      setDragPx(dx * EDGE_RESISTANCE);
      return;
    }
    setDragPx(dx);
  }, []);

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
    applyDrag(dx);
  }, [applyDrag]);

  const onPointerEnd = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (pointerRef.current !== event.pointerId) return;

      const dx = event.clientX - startRef.current.x;
      const dy = event.clientY - startRef.current.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (gestureRef.current.horizontal && absX >= SWIPE_MIN_X && absX > absY) {
        if (dx < 0) goNext();
        else goPrev();
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

  return {
    index,
    slide: openingSlides[index],
    dragPx,
    isDragging,
    goNext,
    goPrev,
    swipeHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
    },
  };
}

export function useOpeningVideo(activeIndex: number) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;

      if (i === activeIndex) {
        const play = () => {
          const promise = video.play();
          if (promise?.catch) promise.catch(() => {});
        };

        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) play();
        else video.addEventListener("loadeddata", play, { once: true });
      } else {
        video.pause();
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
