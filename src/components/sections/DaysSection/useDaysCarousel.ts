"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  DAYS_AUTOPLAY_MS,
  DAYS_TRANSITION_MS,
  daysDesktopMetrics,
  daysMobileMetrics,
  daysSlides,
  getDaysLayouts,
  type CardSlot,
} from "@/lib/days-carousel";

const SWIPE_THRESHOLD = 40;

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return desktop;
}

export function useDaysCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [autoplayKey, setAutoplayKey] = useState(0);
  const pointerRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const activeRef = useRef(activeIndex);
  const isDesktop = useIsDesktop();

  activeRef.current = activeIndex;

  const metrics = isDesktop ? daysDesktopMetrics : daysMobileMetrics;
  const layouts = getDaysLayouts(activeIndex, daysSlides.length, isDesktop);

  const goTo = useCallback((index: number) => {
    const wrapped =
      ((index % daysSlides.length) + daysSlides.length) % daysSlides.length;
    setActiveIndex(wrapped);
    setDragX(0);
    setIsDragging(false);
    setAutoplayKey((k) => k + 1);
  }, []);

  const goNext = useCallback(() => goTo(activeRef.current + 1), [goTo]);
  const goPrev = useCallback(() => goTo(activeRef.current - 1), [goTo]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      goNext();
    }, DAYS_AUTOPLAY_MS);

    return () => window.clearTimeout(timer);
  }, [activeIndex, autoplayKey, goNext]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerRef.current = event.pointerId;
    startXRef.current = event.clientX;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (pointerRef.current !== event.pointerId) return;
    setDragX(event.clientX - startXRef.current);
  }, []);

  const onPointerEnd = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (pointerRef.current !== event.pointerId) return;

      const dx = event.clientX - startXRef.current;
      if (Math.abs(dx) >= SWIPE_THRESHOLD) {
        if (dx < 0) goNext();
        else goPrev();
      } else {
        setDragX(0);
        setIsDragging(false);
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      pointerRef.current = null;
    },
    [goNext, goPrev],
  );

  const getCardStyle = useCallback(
    (slot: CardSlot, slideIndex: number): CSSProperties => {
      const isActive = slot.active;
      const width = isActive ? metrics.activeW : metrics.inactiveW;
      const height = isActive ? metrics.activeH : metrics.inactiveH;
      const left = slot.x + (isDragging && isActive ? dragX : 0);
      const inactiveOffset = !isActive && isDesktop ? daysDesktopMetrics.inactiveY : 0;

      let opacity = 1;
      if (!isDesktop && slot.x <= daysMobileMetrics.peekLeft) opacity = 0;
      if (isDragging && isActive && Math.abs(dragX) > 0) {
        opacity = Math.max(0.3, 1 - Math.abs(dragX) / 160);
      }

      return {
        width: `${width}px`,
        height: `${height}px`,
        left: `${left}px`,
        transform: `translate3d(0, ${inactiveOffset}px, 0)`,
        opacity,
        zIndex: isActive
          ? 2
          : slideIndex === (activeIndex + 1) % daysSlides.length
            ? 1
            : 0,
        transition: isDragging
          ? "none"
          : `left ${DAYS_TRANSITION_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1), width ${DAYS_TRANSITION_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1), height ${DAYS_TRANSITION_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity ${DAYS_TRANSITION_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1), transform ${DAYS_TRANSITION_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
      };
    },
    [activeIndex, dragX, isDesktop, isDragging, metrics],
  );

  const stageHeight = metrics.activeH;

  return {
    activeIndex,
    slide: daysSlides[activeIndex],
    layouts,
    stageHeight,
    isDragging,
    autoplayKey,
    goTo,
    goNext,
    goPrev,
    getCardStyle,
    swipeHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
    },
  };
}
