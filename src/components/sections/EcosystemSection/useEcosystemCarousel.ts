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

function crossfadeBlend(progress: number): number {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  return 0.001 + progress * 0.997;
}

export function useEcosystemCarousel() {
  const [state, setState] = useState(() => stateFromGlobalIndex(0));
  const stateRef = useRef(state);
  const slideTimerRef = useRef<number | null>(null);
  const crossfadeRafRef = useRef<number | null>(null);

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

      if (crossfadeRafRef.current !== null) {
        cancelAnimationFrame(crossfadeRafRef.current);
        crossfadeRafRef.current = null;
      }

      const from = stateRef.current.globalIndex;
      const startedAt = performance.now();
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

      const step = (now: number) => {
        const progress = Math.min((now - startedAt) / HERO_BG_CROSSFADE_MS, 1);

        if (progress >= 1) {
          commitState({
            ...stateRef.current,
            bgMix: { from: wrapped, to: wrapped, blend: 0 },
            isAnimating: false,
          });
          crossfadeRafRef.current = null;
          return;
        }

        commitState({
          ...stateRef.current,
          isAnimating: true,
          bgMix: {
            from,
            to: wrapped,
            blend: crossfadeBlend(progress),
          },
        });

        crossfadeRafRef.current = requestAnimationFrame(step);
      };

      crossfadeRafRef.current = requestAnimationFrame(step);
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
  };
}
