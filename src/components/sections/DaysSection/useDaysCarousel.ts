"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  DAYS_AUTOPLAY_MS,
  DAYS_EASE,
  DAYS_TRANSITION_MS,
  daysDesktopMetrics,
  daysMobileMetrics,
  daysSlides,
} from "@/lib/days-carousel";
import { triggerHaptic, type HapticKind } from "@/lib/haptics";

const SWIPE_THRESHOLD = 40;
const MOBILE_ENTER_MS = 620;
const ENTER_OPACITY_MS = 360;

type CarouselCard = {
  key: string;
  slideIndex: number;
  position: number;
  offset: -1 | 0 | 1 | 2;
  active: boolean;
  departing: boolean;
  next: boolean;
  prev: boolean;
  clickable: boolean;
  style: CSSProperties;
};

function wrapIndex(index: number): number {
  return ((index % daysSlides.length) + daysSlides.length) % daysSlides.length;
}

function nearestPositionForSlide(slideIndex: number, currentPosition: number) {
  const currentIndex = wrapIndex(currentPosition);
  const forward = (slideIndex - currentIndex + daysSlides.length) % daysSlides.length;
  const backward = forward - daysSlides.length;
  const delta = Math.abs(forward) <= Math.abs(backward) ? forward : backward;
  return currentPosition + delta;
}

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

function getSlotStyle(
  offset: CarouselCard["offset"],
  isDesktop: boolean,
): Pick<CSSProperties, "height" | "opacity" | "transform" | "width"> {
  if (isDesktop) {
    const m = daysDesktopMetrics;
    const x =
      offset === -1
        ? -(m.inactiveW + m.gap)
        : offset === 0
          ? 0
          : offset === 1
            ? m.activeW + m.gap
            : m.activeW + m.gap + m.inactiveW + m.gap;
    const y = offset === 0 ? 0 : m.inactiveY;
    const active = offset === 0;

    return {
      width: `${active ? m.activeW : m.inactiveW}px`,
      height: `${active ? m.activeH : m.inactiveH}px`,
      transform: `translate3d(${x}px, ${y}px, 0)`,
      opacity: offset === -1 ? 0 : 1,
    };
  }

  const m = daysMobileMetrics;
  const x =
    offset === -1
      ? m.peekLeft
      : offset === 0
        ? 0
        : offset === 1
          ? m.activeW + m.gap
          : m.activeW + m.gap + m.inactiveW + m.gap;
  const active = offset === 0;

  return {
    width: `${active ? m.activeW : m.inactiveW}px`,
    height: `${active ? m.activeH : m.inactiveH}px`,
    transform: `translate3d(${x}px, 0, 0)`,
    opacity: offset === -1 ? 0 : 1,
  };
}

export function useDaysCarousel() {
  const [activePosition, setActivePosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [autoplayKey, setAutoplayKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [departingPosition, setDepartingPosition] = useState<number | null>(null);
  const pointerRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const activePositionRef = useRef(activePosition);
  const transitioningRef = useRef(false);
  const transitionTimerRef = useRef<number | null>(null);
  const isDesktop = useIsDesktop();

  const activeIndex = wrapIndex(activePosition);
  const metrics = isDesktop ? daysDesktopMetrics : daysMobileMetrics;

  useEffect(() => {
    activePositionRef.current = activePosition;
  }, [activePosition]);

  const goToPosition = useCallback(
    (targetPosition: number, kind: HapticKind | false = false) => {
      const currentPosition = activePositionRef.current;
      if (targetPosition === currentPosition || transitioningRef.current) return;

      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }

      activePositionRef.current = targetPosition;
      transitioningRef.current = true;
      setDepartingPosition(currentPosition);
      setIsTransitioning(true);
      if (kind !== false) triggerHaptic(kind);
      setActivePosition(targetPosition);
      setDragX(0);
      setIsDragging(false);
      setAutoplayKey((k) => k + 1);

      transitionTimerRef.current = window.setTimeout(() => {
        transitioningRef.current = false;
        setIsTransitioning(false);
        setDepartingPosition(null);
        transitionTimerRef.current = null;
      }, DAYS_TRANSITION_MS);
    },
    [],
  );

  const goTo = useCallback(
    (slideIndex: number, kind: HapticKind | false = false) => {
      goToPosition(
        nearestPositionForSlide(slideIndex, activePositionRef.current),
        kind,
      );
    },
    [goToPosition],
  );

  const goNext = useCallback(
    (kind: HapticKind | false = "navigate") =>
      goToPosition(activePositionRef.current + 1, kind),
    [goToPosition],
  );

  const goPrev = useCallback(
    (kind: HapticKind | false = "navigate") =>
      goToPosition(activePositionRef.current - 1, kind),
    [goToPosition],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      goNext(false);
    }, DAYS_AUTOPLAY_MS);

    return () => window.clearTimeout(timer);
  }, [activePosition, autoplayKey, goNext]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (transitioningRef.current) return;
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

  const cards = useMemo<CarouselCard[]>(() => {
    const offsets: CarouselCard["offset"][] = [-1, 0, 1, 2];

    return offsets.map((offset) => {
      const position = activePosition + offset;
      const slideIndex = wrapIndex(position);
      const active = offset === 0;
      const departing = isTransitioning && departingPosition === position;
      const next = offset === 1;
      const prev = offset === -1;
      const slotStyle = getSlotStyle(offset, isDesktop);
      const draggedX = isDragging && active ? dragX : 0;
      const useMobileEnterTransition =
        !isDesktop && isTransitioning && !isDragging && (active || next);
      const transition: CSSProperties["transition"] =
        useMobileEnterTransition
          ? [
              `transform ${MOBILE_ENTER_MS}ms ${DAYS_EASE}`,
              `width ${MOBILE_ENTER_MS}ms ${DAYS_EASE}`,
              `height ${MOBILE_ENTER_MS}ms ${DAYS_EASE}`,
              `opacity ${ENTER_OPACITY_MS}ms ${DAYS_EASE}`,
              `border-radius ${MOBILE_ENTER_MS}ms ${DAYS_EASE}`,
            ].join(", ")
          : undefined;

      return {
        key: `${daysSlides[slideIndex].id}-${position}`,
        slideIndex,
        position,
        offset,
        active,
        departing,
        next,
        prev,
        clickable: next && !isTransitioning,
        style: {
          ...slotStyle,
          transform: draggedX
            ? `translate3d(${draggedX}px, 0, 0) ${slotStyle.transform}`
            : slotStyle.transform,
          opacity: departing ? 0 : slotStyle.opacity,
          zIndex: active ? 20 : departing ? 10 : next ? 11 : offset === 2 ? 5 : 0,
          transition,
        },
      };
    });
  }, [
    activePosition,
    departingPosition,
    dragX,
    isDesktop,
    isDragging,
    isTransitioning,
  ]);

  return {
    activeIndex,
    slide: daysSlides[activeIndex],
    cards,
    stageHeight: metrics.activeH,
    isDragging,
    autoplayKey,
    goTo,
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
