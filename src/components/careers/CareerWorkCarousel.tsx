"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/design-system/components";
import { careerWorkSlides } from "@/lib/career-data";
import { triggerHaptic } from "@/lib/haptics";
import { images } from "@/lib/media";
import styles from "./careers.module.css";

const SLIDE_GAP = 20;

function getSlideStride(container: HTMLDivElement) {
  const slide = container.querySelector<HTMLElement>(`.${styles.workSlide}`);
  if (!slide) return 346;
  return slide.offsetWidth + SLIDE_GAP;
}

export function CareerWorkCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const maxIndex = careerWorkSlides.length - 1;
  const canGoPrev = index > 0;
  const canGoNext = index < maxIndex;

  const scrollToIndex = useCallback((next: number) => {
    const container = trackRef.current;
    if (!container) return;

    const clamped = Math.max(0, Math.min(next, maxIndex));
    const stride = getSlideStride(container);

    setIndex(clamped);
    container.scrollTo({
      left: clamped * stride,
      behavior: "smooth",
    });
  }, [maxIndex]);

  useEffect(() => {
    const container = trackRef.current;
    if (!container) return;

    const syncIndexFromScroll = () => {
      const stride = getSlideStride(container);
      const nextIndex = Math.round(container.scrollLeft / stride);
      setIndex(Math.max(0, Math.min(nextIndex, maxIndex)));
    };

    container.addEventListener("scroll", syncIndexFromScroll, { passive: true });
    return () => container.removeEventListener("scroll", syncIndexFromScroll);
  }, [maxIndex]);

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
              {careerWorkSlides.map((slide) => (
                <article
                  key={slide.id}
                  className={styles.workSlide}
                  aria-label={slide.title}
                >
                  <Image
                    src={images[slide.imageKey]}
                    alt=""
                    width={652}
                    height={640}
                    className={styles.workSlideImage}
                  />
                  {slide.body ? (
                    <span className={styles.srOnly}>{slide.body}</span>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
