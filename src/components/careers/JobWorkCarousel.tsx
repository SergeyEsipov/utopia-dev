"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Icon } from "@/design-system/components";
import {
  careerWorkHeading,
  careerWorkSlides,
  type WorkSlide,
} from "@/lib/career-data";
import { triggerHaptic } from "@/lib/haptics";
import { images } from "@/lib/media";
import styles from "./job-opening.module.css";

/**
 * Job-opening variant of the "Work defined by extraordinary places" carousel —
 * Figma 24.07 `154:2047` / `154:2800` / `154:3257`: cream background, dark
 * heading, center-snapped slides with the middle slide centered initially, and
 * nav arrows below the track on mobile/tablet, beside the heading on desktop.
 *
 * `154:2034` and `154:2104` draw the same block and are both hidden in the
 * desktop frame — `154:2047` is the live one.
 */

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function slideCenterScrollLeft(
  container: HTMLDivElement,
  slide: HTMLElement,
) {
  const target =
    slide.offsetLeft + slide.offsetWidth / 2 - container.clientWidth / 2;
  const maxScrollLeft = Math.max(
    0,
    container.scrollWidth - container.clientWidth,
  );
  return Math.max(0, Math.min(target, maxScrollLeft));
}

function JobWorkSlideCard({
  slide,
  slideRef,
}: {
  slide: WorkSlide;
  slideRef: (node: HTMLElement | null) => void;
}) {
  if (slide.layout === "text") {
    return (
      <article
        ref={slideRef}
        className={[styles.jobWorkSlide, styles.jobWorkSlideText].join(" ")}
        aria-label={slide.title}
      >
        <p className={styles.jobWorkSlideBody}>{slide.body}</p>
        <p className={styles.jobWorkSlideTextTitle}>{slide.title}</p>
      </article>
    );
  }

  return (
    <article
      ref={slideRef}
      className={styles.jobWorkSlide}
      aria-label={slide.title}
    >
      <div className={styles.jobWorkSlideMedia}>
        <Image
          src={images[slide.imageKey!]}
          alt=""
          fill
          sizes="(min-width: 640px) 326px, 217px"
          className={styles.jobWorkSlideImage}
        />
      </div>
      <div className={styles.jobWorkSlideOverlay} aria-hidden />
      <div className={styles.jobWorkSlideGradient} aria-hidden />
      {/* Progressive blur under the caption (review #28, Figma `4114-15409`).
          Six stacked bands, each doubling the blur of the one above it and each
          masked to a shorter window measured from the bottom edge, so the
          softening ramps into the photograph instead of ending on a seam. A
          single `backdrop-filter` cannot do this: it applies evenly across its
          whole box no matter what gradient sits on it — the same trap the Team
          up right-edge fade documents. */}
      <div className={styles.jobWorkSlideBlur} aria-hidden>
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      {slide.badge ? (
        <span className={styles.jobWorkSlideBadge}>{slide.badge}</span>
      ) : null}
      <p className={styles.jobWorkSlideTitle}>{slide.title}</p>
    </article>
  );
}

export function JobWorkCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const middleIndex = Math.floor(careerWorkSlides.length / 2);
  const [canGoPrev, setCanGoPrev] = useState(true);
  const [canGoNext, setCanGoNext] = useState(true);

  const syncFromScroll = useCallback(() => {
    const container = trackRef.current;
    if (!container) return;

    const maxScrollLeft = Math.max(
      0,
      container.scrollWidth - container.clientWidth,
    );
    setCanGoPrev(container.scrollLeft > 1);
    setCanGoNext(container.scrollLeft < maxScrollLeft - 1);
  }, []);

  // Reachable center-snap stops (slide-center positions clamped to the
  // scroll range — at wide viewports the outermost stops collapse).
  const scrollToNeighbor = useCallback((direction: -1 | 1) => {
    const container = trackRef.current;
    if (!container) return;

    const current = container.scrollLeft;
    let target: number | undefined;
    slideRefs.current.forEach((slide) => {
      if (!slide) return;
      const stop = slideCenterScrollLeft(container, slide);
      if (direction === 1) {
        if (stop > current + 8 && (target === undefined || stop < target)) {
          target = stop;
        }
      } else if (stop < current - 8 && (target === undefined || stop > target)) {
        target = stop;
      }
    });
    if (target === undefined) return;

    container.scrollTo({ left: target, behavior: "smooth" });
  }, []);

  // Initial position: middle slide centered (matches the Figma composition
  // at every breakpoint — the card row bleeds evenly on both sides).
  useIsomorphicLayoutEffect(() => {
    const container = trackRef.current;
    const slide = slideRefs.current[middleIndex];
    if (container && slide) {
      container.scrollLeft = slideCenterScrollLeft(container, slide);
    }
    syncFromScroll();
  }, [middleIndex, syncFromScroll]);

  useEffect(() => {
    const container = trackRef.current;
    if (!container) return;

    const ro = new ResizeObserver(syncFromScroll);
    ro.observe(container);

    let scrollEndTimer: ReturnType<typeof setTimeout> | undefined;

    const handleScroll = () => {
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(syncFromScroll, 80);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("scrollend", syncFromScroll);

    return () => {
      ro.disconnect();
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("scrollend", syncFromScroll);
    };
  }, [syncFromScroll]);

  const handlePrev = () => {
    if (!canGoPrev) return;
    triggerHaptic("navigate");
    scrollToNeighbor(-1);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    triggerHaptic("navigate");
    scrollToNeighbor(1);
  };

  return (
    <section className={styles.jobWork} aria-labelledby="job-work-title">
      <div className={styles.jobWorkHeader}>
        <h2 id="job-work-title" className={styles.jobWorkTitle}>
          {careerWorkHeading}
        </h2>
      </div>

      <div className={styles.jobWorkTrackWrap} ref={trackRef}>
        <div className={styles.jobWorkTrack}>
          {careerWorkSlides.map((slide, slideIndex) => (
            <JobWorkSlideCard
              key={slide.id}
              slide={slide}
              slideRef={(node) => {
                slideRefs.current[slideIndex] = node;
              }}
            />
          ))}
        </div>
      </div>

      <div className={styles.jobWorkNav} aria-label="Carousel navigation">
        <button
          type="button"
          className={[
            styles.jobWorkNavBtn,
            canGoPrev ? "" : styles.jobWorkNavBtnInactive,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={handlePrev}
          disabled={!canGoPrev}
          aria-label="Previous slide"
        >
          <Icon
            name="chevronDark"
            size={12}
            alt=""
            className={styles.jobWorkNavChevronLeft}
          />
        </button>
        <button
          type="button"
          className={[
            styles.jobWorkNavBtn,
            canGoNext ? "" : styles.jobWorkNavBtnInactive,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={handleNext}
          disabled={!canGoNext}
          aria-label="Next slide"
        >
          <Icon name="chevronDark" size={12} alt="" />
        </button>
      </div>
    </section>
  );
}
