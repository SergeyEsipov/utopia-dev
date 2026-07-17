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
  daysMobileMetrics,
  daysSlides,
  getDaysStackedMetrics,
  type DaysBreakpoint,
} from "@/lib/days-carousel";
import { triggerHaptic, type HapticKind } from "@/lib/haptics";

const SWIPE_THRESHOLD = 40;
const SWIPE_LOCK_X = 8;
const SWIPE_LOCK_Y = 8;
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

const DAYS_BREAKPOINT_QUERIES: ReadonlyArray<
  readonly [Exclude<DaysBreakpoint, "mobile">, string]
> = [
  ["wide", "(min-width: 1900px)"],
  ["desktop", "(min-width: 1024px)"],
  ["tablet", "(min-width: 640px)"],
];

function useDaysBreakpoint(): DaysBreakpoint {
  const [breakpoint, setBreakpoint] = useState<DaysBreakpoint>("mobile");

  useEffect(() => {
    const queries = DAYS_BREAKPOINT_QUERIES.map(
      ([name, query]) => [name, window.matchMedia(query)] as const,
    );
    const update = () => {
      const match = queries.find(([, mq]) => mq.matches);
      setBreakpoint(match ? match[0] : "mobile");
    };
    update();
    queries.forEach(([, mq]) => mq.addEventListener("change", update));
    return () =>
      queries.forEach(([, mq]) => mq.removeEventListener("change", update));
  }, []);

  return breakpoint;
}

function getSlotStyle(
  offset: CarouselCard["offset"],
  breakpoint: DaysBreakpoint,
): Pick<CSSProperties, "height" | "opacity" | "transform" | "width"> {
  if (breakpoint !== "mobile") {
    const m = getDaysStackedMetrics(breakpoint);
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
  const [autoplayKey, setAutoplayKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [departingPosition, setDepartingPosition] = useState<number | null>(null);
  const [isInView, setIsInView] = useState(true);
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const activeCardRef = useRef<HTMLElement | null>(null);
  const activeBaseTransformRef = useRef("");
  const cardsRef = useRef<CarouselCard[]>([]);
  const dragXRef = useRef(0);
  const dragRafRef = useRef<number | null>(null);
  const pointerRef = useRef<number | null>(null);
  const startRef = useRef({ x: 0, y: 0 });
  const gestureRef = useRef({ locked: false, horizontal: false });
  const activePositionRef = useRef(activePosition);
  const transitioningRef = useRef(false);
  const transitionTimerRef = useRef<number | null>(null);
  const breakpoint = useDaysBreakpoint();

  const activeIndex = wrapIndex(activePosition);
  const metrics =
    breakpoint === "mobile"
      ? daysMobileMetrics
      : getDaysStackedMetrics(breakpoint);

  useEffect(() => {
    activePositionRef.current = activePosition;
  }, [activePosition]);

  // Pause autoplay while the section is off-screen — matches the prototype's
  // IntersectionObserver gating and avoids advancing slides the user can't see.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Block vertical page scroll once a horizontal swipe is locked. React's
  // onTouchMove is passive, so preventDefault there is ignored and the page
  // scrolls (cancelling the gesture, bug #7) — a native non-passive listener is
  // the only thing that can stop it.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onTouchMove = (event: TouchEvent) => {
      if (gestureRef.current.horizontal) event.preventDefault();
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, []);

  const cancelTransition = useCallback(() => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    transitioningRef.current = false;
    setIsTransitioning(false);
    setDepartingPosition(null);
  }, []);

  const applyActiveCardDrag = useCallback(() => {
    const card = activeCardRef.current;
    if (!card) return;

    const dx = dragXRef.current;
    const base = activeBaseTransformRef.current;
    card.style.transform = dx
      ? `translate3d(${dx}px, 0, 0) ${base}`
      : base;
  }, []);

  const resetActiveCardDrag = useCallback(() => {
    dragXRef.current = 0;
    applyActiveCardDrag();
  }, [applyActiveCardDrag]);

  const goToPosition = useCallback(
    (targetPosition: number, kind: HapticKind | false = false) => {
      const currentPosition = activePositionRef.current;
      if (targetPosition === currentPosition) return;

      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }

      activePositionRef.current = targetPosition;
      transitioningRef.current = true;
      setDepartingPosition(currentPosition);
      setIsTransitioning(true);
      if (kind !== false) triggerHaptic(kind);
      setActivePosition(targetPosition);
      dragXRef.current = 0;
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
    // Don't auto-advance mid-gesture (it would fire goNext while the pointer is
    // still down and captured), and honour reduced-motion by not auto-advancing.
    if (isDragging || !isInView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setTimeout(() => {
      goNext(false);
    }, DAYS_AUTOPLAY_MS);

    return () => window.clearTimeout(timer);
  }, [activePosition, autoplayKey, goNext, isDragging, isInView]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      if (dragRafRef.current !== null) {
        window.cancelAnimationFrame(dragRafRef.current);
      }
    };
  }, []);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    cancelTransition();
    pointerRef.current = event.pointerId;
    startRef.current = { x: event.clientX, y: event.clientY };
    gestureRef.current = { locked: false, horizontal: false };

    const active = cardsRef.current.find((card) => card.active);
    activeBaseTransformRef.current =
      typeof active?.style.transform === "string" ? active.style.transform : "";

    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [cancelTransition]);

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
    dragXRef.current = dx;
    if (dragRafRef.current !== null) return;

    dragRafRef.current = window.requestAnimationFrame(() => {
      dragRafRef.current = null;
      applyActiveCardDrag();
    });
  }, [applyActiveCardDrag]);

  const onPointerEnd = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (pointerRef.current !== event.pointerId) return;

      const dx = event.clientX - startRef.current.x;
      const dy = event.clientY - startRef.current.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (gestureRef.current.horizontal && absX >= SWIPE_THRESHOLD && absX > absY) {
        if (dx < 0) goNext("success");
        else goPrev("success");
      } else {
        resetActiveCardDrag();
        setIsDragging(false);
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      pointerRef.current = null;
      gestureRef.current = { locked: false, horizontal: false };
    },
    [goNext, goPrev, resetActiveCardDrag],
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
      const slotStyle = getSlotStyle(offset, breakpoint);
      const useMobileEnterTransition =
        breakpoint === "mobile" &&
        isTransitioning &&
        !isDragging &&
        (active || next);
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
          transform: slotStyle.transform,
          opacity: departing ? 0 : slotStyle.opacity,
          zIndex: active ? 20 : departing ? 10 : next ? 11 : offset === 2 ? 5 : 0,
          transition,
        },
      };
    });
  }, [
    activePosition,
    breakpoint,
    departingPosition,
    isDragging,
    isTransitioning,
  ]);

  cardsRef.current = cards;

  const registerActiveCard = useCallback(
    (node: HTMLElement | null, active: boolean) => {
      if (active) {
        activeCardRef.current = node;
      }
    },
    [],
  );

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
    registerActiveCard,
    sectionRef,
    stageRef,
    swipeHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
    },
  };
}
