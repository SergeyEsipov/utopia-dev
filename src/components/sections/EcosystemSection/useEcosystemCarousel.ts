"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ECOSYSTEM_SLIDE_DURATION_MS,
  ecosystemCategoryData,
  ecosystemSlides,
  type FlatEcosystemSlide,
} from "@/lib/ecosystem-carousel";
import {
  HERO_BG_CROSSFADE_MS,
  type HeroBackgroundMix,
} from "@/lib/hero-carousel";
import { triggerHaptic } from "@/lib/haptics";

const SWIPE_MIN_X = 28;
const SWIPE_LOCK_X = 8;
const SWIPE_LOCK_Y = 8;

type CarouselState = {
  globalIndex: number;
  categoryIndex: number;
  slideIndex: number;
  slide: FlatEcosystemSlide;
  bgMix: HeroBackgroundMix;
  isAnimating: boolean;
};

function wrapGlobalIndex(globalIndex: number): number {
  return (
    ((globalIndex % ecosystemSlides.length) + ecosystemSlides.length) %
    ecosystemSlides.length
  );
}

function stateFromGlobalIndex(
  globalIndex: number,
  bgMix?: HeroBackgroundMix,
  isAnimating = false,
): CarouselState {
  const slide = ecosystemSlides[globalIndex];
  return {
    globalIndex,
    categoryIndex: slide.categoryIndex,
    slideIndex: slide.slideIndex,
    slide,
    bgMix: bgMix ?? { from: globalIndex, to: globalIndex, blend: 0 },
    isAnimating,
  };
}

export function useEcosystemCarousel() {
  const [state, setState] = useState(() => stateFromGlobalIndex(0));
  const stateRef = useRef(state);
  const slideTimerRef = useRef<number | null>(null);
  const crossfadeTimerRef = useRef<number | null>(null);
  const crossfadeRafRef = useRef<number | null>(null);
  const pointerRef = useRef<number | null>(null);
  const startRef = useRef({ x: 0, y: 0 });
  const gestureRef = useRef({ locked: false, horizontal: false });

  const commitState = useCallback((next: CarouselState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const advanceTo = useCallback(
    (targetIndex: number, haptic: "navigate" | "selection" | false = false) => {
      const wrapped = wrapGlobalIndex(targetIndex);
      if (wrapped === stateRef.current.globalIndex) {
        return;
      }

      if (haptic === "navigate") triggerHaptic("navigate");
      if (haptic === "selection") triggerHaptic("selection");

      if (crossfadeTimerRef.current !== null) {
        window.clearTimeout(crossfadeTimerRef.current);
        crossfadeTimerRef.current = null;
      }
      if (crossfadeRafRef.current !== null) {
        cancelAnimationFrame(crossfadeRafRef.current);
        crossfadeRafRef.current = null;
      }

      const from = stateRef.current.globalIndex;
      const targetState = stateFromGlobalIndex(
        wrapped,
        {
          from,
          to: wrapped,
          blend: 0,
        },
        true,
      );

      commitState(targetState);

      crossfadeRafRef.current = window.requestAnimationFrame(() => {
        crossfadeRafRef.current = window.requestAnimationFrame(() => {
          crossfadeRafRef.current = null;
          commitState({
            ...stateRef.current,
            isAnimating: true,
            bgMix: {
              from,
              to: wrapped,
              blend: 1,
            },
          });
        });
      });

      crossfadeTimerRef.current = window.setTimeout(() => {
        crossfadeTimerRef.current = null;
        commitState({
          ...stateRef.current,
          bgMix: { from: wrapped, to: wrapped, blend: 0 },
          isAnimating: false,
        });
      }, HERO_BG_CROSSFADE_MS);
    },
    [commitState],
  );

  const goNext = useCallback(() => {
    advanceTo(stateRef.current.globalIndex + 1, "navigate");
  }, [advanceTo]);

  const goPrev = useCallback(() => {
    advanceTo(stateRef.current.globalIndex - 1, "navigate");
  }, [advanceTo]);

  const goToCategory = useCallback(
    (categoryIndex: number) => {
      const target = ecosystemSlides.find(
        (slide) => slide.categoryIndex === categoryIndex,
      );
      if (!target) return;
      if (target.categoryIndex === stateRef.current.categoryIndex) return;
      advanceTo(target.globalIndex, "selection");
    },
    [advanceTo],
  );

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    pointerRef.current = event.pointerId;
    startRef.current = { x: event.clientX, y: event.clientY };
    gestureRef.current = { locked: false, horizontal: false };
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
  }, []);

  const onPointerEnd = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (pointerRef.current !== event.pointerId) return;

      const dx = event.clientX - startRef.current.x;
      const dy = event.clientY - startRef.current.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (
        gestureRef.current.horizontal &&
        absX >= SWIPE_MIN_X &&
        absX > absY
      ) {
        if (dx < 0) goNext();
        else goPrev();
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
    slideTimerRef.current = window.setTimeout(() => {
      advanceTo(stateRef.current.globalIndex + 1, false);
    }, ECOSYSTEM_SLIDE_DURATION_MS);

    return () => {
      if (slideTimerRef.current !== null) {
        window.clearTimeout(slideTimerRef.current);
        slideTimerRef.current = null;
      }
    };
  }, [advanceTo, state.globalIndex]);

  useEffect(() => {
    return () => {
      if (crossfadeTimerRef.current !== null) {
        window.clearTimeout(crossfadeTimerRef.current);
      }
      if (crossfadeRafRef.current !== null) {
        cancelAnimationFrame(crossfadeRafRef.current);
      }
    };
  }, []);

  const displayIndex =
    state.isAnimating && state.bgMix.from !== state.bgMix.to
      ? state.bgMix.to
      : state.globalIndex;
  const displaySlide = ecosystemSlides[displayIndex];

  return {
    globalIndex: state.globalIndex,
    categoryIndex: displaySlide.categoryIndex,
    slideIndex: displaySlide.slideIndex,
    slide: displaySlide,
    bgMix: state.bgMix,
    isAnimating: state.isAnimating,
    categoryLabels: ecosystemCategoryData.map((category) => category.label),
    goNext,
    goPrev,
    goToCategory,
    swipeHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
    },
  };
}
