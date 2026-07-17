"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/design-system/components";
import { careerWorkSlides, type WorkSlide } from "@/lib/career-data";
import { triggerHaptic } from "@/lib/haptics";
import { images } from "@/lib/media";
import styles from "./careers.module.css";

const SLIDE_GAP = 20;

function getScrollMetrics(container: HTMLDivElement) {
  const slide = container.querySelector<HTMLElement>(`.${styles.workSlide}`);
  if (!slide) {
    return { stride: 346, maxIndex: 0, maxScrollLeft: 0 };
  }

  const stride = slide.offsetWidth + SLIDE_GAP;
  const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
  const maxIndex =
    maxScrollLeft <= 0 ? 0 : Math.round(maxScrollLeft / stride);

  return { stride, maxIndex, maxScrollLeft };
}

function WorkSlideCard({
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
        className={[styles.workSlide, styles.workSlideText].join(" ")}
        aria-label={slide.title}
      >
        <p className={styles.workSlideBody}>{slide.body}</p>
        <p className={styles.workSlideTextTitle}>{slide.title}</p>
      </article>
    );
  }

  return (
    <article
      ref={slideRef}
      className={[styles.workSlide, styles.workSlideOverlayCard].join(" ")}
      aria-label={slide.title}
    >
      <div className={styles.workSlideMedia}>
        <Image
          src={images[slide.imageKey!]}
          alt=""
          fill
          sizes="326px"
          className={styles.workSlideImage}
        />
      </div>
      <div className={styles.workSlideOverlay} aria-hidden />
      <div className={styles.workSlideGradient} aria-hidden />
      {slide.badge ? (
        <span className={styles.workSlideBadge}>{slide.badge}</span>
      ) : null}
      <p className={styles.workSlideTitle}>{slide.title}</p>
    </article>
  );
}

export function CareerWorkCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(careerWorkSlides.length - 1);
  const canGoPrev = index > 0;
  const canGoNext = index < maxIndex;

  const syncMetrics = useCallback(() => {
    const container = trackRef.current;
    if (!container) return;

    const metrics = getScrollMetrics(container);
    setMaxIndex(metrics.maxIndex);
    setIndex((current) => Math.min(current, metrics.maxIndex));
  }, []);

  const syncIndexFromScroll = useCallback(() => {
    const container = trackRef.current;
    if (!container) return;

    const { stride, maxIndex: max, maxScrollLeft } = getScrollMetrics(container);
    const atEnd = container.scrollLeft >= maxScrollLeft - 1;
    const nextIndex = atEnd
      ? max
      : Math.max(0, Math.min(max, Math.round(container.scrollLeft / stride)));

    setMaxIndex(max);
    setIndex(nextIndex);
  }, []);

  const scrollToIndex = useCallback((next: number) => {
    const container = trackRef.current;
    if (!container) return;

    const { maxIndex: max } = getScrollMetrics(container);
    const clamped = Math.max(0, Math.min(next, max));
    const target = slideRefs.current[clamped];

    setIndex(clamped);
    setMaxIndex(max);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        inline: "start",
        block: "nearest",
      });
      return;
    }

    const { stride, maxScrollLeft } = getScrollMetrics(container);
    container.scrollTo({
      left: Math.min(clamped * stride, maxScrollLeft),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const container = trackRef.current;
    if (!container) return;

    syncMetrics();

    const ro = new ResizeObserver(syncMetrics);
    ro.observe(container);

    let scrollEndTimer: ReturnType<typeof setTimeout> | undefined;

    const handleScroll = () => {
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(syncIndexFromScroll, 80);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("scrollend", syncIndexFromScroll);

    return () => {
      ro.disconnect();
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("scrollend", syncIndexFromScroll);
    };
  }, [syncIndexFromScroll, syncMetrics]);

  const handlePrev = () => {
    if (!canGoPrev) return;
    triggerHaptic("navigate");
    scrollToIndex(index - 1);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    triggerHaptic("navigate");
    scrollToIndex(index + 1);
  };

  return (
    <section className={styles.work} aria-labelledby="career-work-title">
      <div className={styles.sectionWide}>
        <div className={`${styles.sectionInner} ${styles.workInner}`}>
          <div className={styles.workHeader}>
            <h2 id="career-work-title" className={styles.workTitle}>
              Work shaped by rare places and high standards
            </h2>
            <div className={styles.workNav} aria-label="Carousel navigation">
              <button
                type="button"
                className={[
                  styles.workNavBtn,
                  canGoPrev ? styles.workNavBtnActive : styles.workNavBtnInactive,
                ].join(" ")}
                onClick={handlePrev}
                disabled={!canGoPrev}
                aria-label="Previous slide"
              >
                <Icon
                  name="chevronDark"
                  size={12}
                  alt=""
                  className={styles.workNavChevronLeft}
                />
              </button>
              <button
                type="button"
                className={[
                  styles.workNavBtn,
                  canGoNext ? styles.workNavBtnActive : styles.workNavBtnInactive,
                ].join(" ")}
                onClick={handleNext}
                disabled={!canGoNext}
                aria-label="Next slide"
              >
                <Icon name="chevronDark" size={12} alt="" />
              </button>
            </div>
          </div>

          <div className={styles.workTrackWrap} ref={trackRef}>
            <div className={styles.workTrack}>
              {careerWorkSlides.map((slide, slideIndex) => (
                <WorkSlideCard
                  key={slide.id}
                  slide={slide}
                  slideRef={(node) => {
                    slideRefs.current[slideIndex] = node;
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
