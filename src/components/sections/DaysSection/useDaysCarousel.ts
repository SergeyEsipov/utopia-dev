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
import { triggerHaptic, type HapticKind } from "@/lib/haptics";

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pointerRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const activeRef = useRef(activeIndex);
  const isDesktop = useIsDesktop();

  activeRef.current = activeIndex;

  const metrics = isDesktop ? daysDesktopMetrics : daysMobileMetrics;
  const layouts = getDaysLayouts(activeIndex, daysSlides.length, isDesktop);

  const goTo = useCallback((index: number, kind: HapticKind | false = false) => {
    const wrapped =
      ((index % daysSlides.length) + daysSlides.length) % daysSlides.length;
    if (wrapped !== activeRef.current && kind !== false) triggerHaptic(kind);
    setActiveIndex(wrapped);
    setDragX(0);
    setIsDragging(false);
    setAutoplayKey((k) => k + 1);
  }, []);

  const goNext = useCallback(
    (kind: HapticKind | false = "navigate") => goTo(activeRef.current + 1, kind),
    [goTo],
  );
  const goPrev = useCallback(
    (kind: HapticKind | false = "navigate") => goTo(activeRef.current - 1, kind),
    [goTo],
  );

  useEffect(() => {
    setIsTransitioning(true);
    const timer = window.setTimeout(() => {
      setIsTransitioning(false);
    }, DAYS_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      goNext(false);
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
        if (dx < 0) goNext("success");
        else goPrev("success");
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
      const x = slot.x + (isDragging && isActive ? dragX : 0);
      const inactiveOffset = !isActive && isDesktop ? daysDesktopMetrics.inactiveY : 0;

      let opacity = 1;
      if (
        !isDesktop &&
        slot.x <= daysMobileMetrics.peekLeft &&
        !isTransitioning &&
        !isDragging
      ) {
        opacity = 0;
      }
      if (isDragging && isActive && Math.abs(dragX) > 0) {
        opacity = Math.max(0.55, 1 - Math.abs(dragX) / 280);
      }

      return {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate3d(${x}px, ${inactiveOffset}px, 0)`,
        opacity,
        zIndex: isActive
          ? 2
          : slideIndex === (activeIndex + 1) % daysSlides.length
            ? 1
            : 0,
      };
    },
    [activeIndex, dragX, isDesktop, isDragging, isTransitioning, metrics],
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
