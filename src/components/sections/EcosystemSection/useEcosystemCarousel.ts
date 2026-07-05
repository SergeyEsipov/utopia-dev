"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ECOSYSTEM_SLIDE_DURATION_MS,
  ecosystemCategoryData,
  ecosystemSlides,
  getCategoryProgress,
  type FlatEcosystemSlide,
} from "@/lib/ecosystem-carousel";

type CarouselState = {
  globalIndex: number;
  categoryIndex: number;
  slideIndex: number;
  slide: FlatEcosystemSlide;
  categoryProgress: number;
};

function stateFromGlobalIndex(globalIndex: number, slideProgress = 0): CarouselState {
  const slide = ecosystemSlides[globalIndex];
  return {
    globalIndex,
    categoryIndex: slide.categoryIndex,
    slideIndex: slide.slideIndex,
    slide,
    categoryProgress: getCategoryProgress(
      slide.categoryIndex,
      slide.slideIndex,
      slideProgress,
    ),
  };
}

export function useEcosystemCarousel() {
  const [state, setState] = useState(() => stateFromGlobalIndex(0));
  const slideStartRef = useRef(performance.now());
  const pausedElapsedRef = useRef(0);
  const pausedRef = useRef(false);
  const stateRef = useRef(state);

  stateRef.current = state;

  const goToGlobalIndex = useCallback((globalIndex: number) => {
    const wrapped =
      ((globalIndex % ecosystemSlides.length) + ecosystemSlides.length) %
      ecosystemSlides.length;

    slideStartRef.current = performance.now();
    pausedElapsedRef.current = 0;
    setState(stateFromGlobalIndex(wrapped, 0));
  }, []);

  const goNext = useCallback(() => {
    goToGlobalIndex(stateRef.current.globalIndex + 1);
  }, [goToGlobalIndex]);

  const goPrev = useCallback(() => {
    goToGlobalIndex(stateRef.current.globalIndex - 1);
  }, [goToGlobalIndex]);

  const goToCategory = useCallback(
    (categoryIndex: number) => {
      const target = ecosystemSlides.find((s) => s.categoryIndex === categoryIndex);
      if (target) goToGlobalIndex(target.globalIndex);
    },
    [goToGlobalIndex],
  );

  useEffect(() => {
    let rafId = 0;

    const tick = (now: number) => {
      if (!pausedRef.current) {
        const elapsed = pausedElapsedRef.current + (now - slideStartRef.current);
        const slideProgress = Math.min(elapsed / ECOSYSTEM_SLIDE_DURATION_MS, 1);
        const current = stateRef.current;

        setState(stateFromGlobalIndex(current.globalIndex, slideProgress));

        if (slideProgress >= 1) {
          goToGlobalIndex(current.globalIndex + 1);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [goToGlobalIndex]);

  const pause = useCallback(() => {
    if (pausedRef.current) return;
    pausedElapsedRef.current += performance.now() - slideStartRef.current;
    pausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    if (!pausedRef.current) return;
    slideStartRef.current = performance.now();
    pausedRef.current = false;
  }, []);

  return {
    ...state,
    categoryLabels: ecosystemCategoryData.map((c) => c.label),
    goNext,
    goPrev,
    goToCategory,
    pause,
    resume,
  };
}
