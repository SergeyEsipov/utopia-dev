"use client";

import { Heading, Text, Button, NavPill } from "@/design-system/components";
import { openingCopy, openingSlides } from "@/lib/opening-carousel";
import {
  useOpeningCarousel,
  useOpeningVideo,
} from "./useOpeningCarousel";
import styles from "./opening-section.module.css";

export function OpeningSection() {
  const { index, slide, dragPx, isDragging, goNext, goPrev, swipeHandlers } =
    useOpeningCarousel();
  const { setVideoRef } = useOpeningVideo(index);

  const trackOffset = `calc(-${index * 100}% + ${dragPx}px)`;

  return (
    <section className={styles.section} aria-label="Opening">
      <div className={styles.frame} {...swipeHandlers}>
        <div className={styles.slides}>
          <div
            className={[styles.track, isDragging ? styles.trackDragging : ""]
              .filter(Boolean)
              .join(" ")}
            style={{ transform: `translate3d(${trackOffset}, 0, 0)` }}
          >
            {openingSlides.map((item, i) => (
              <div
                key={item.id}
                className={[styles.slide, i === index ? styles.slideActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden={i !== index}
              >
                <div
                  className={[
                    styles.bgSlide,
                    styles[`bgSlide${item.layout}` as keyof typeof styles],
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <video
                    ref={setVideoRef(i)}
                    className={styles.bgVideo}
                    muted
                    loop
                    playsInline
                    preload={Math.abs(i - index) <= 1 ? "metadata" : "none"}
                    poster={item.poster}
                  >
                    {item.videoWebm ? (
                      <source src={item.videoWebm} type="video/webm" />
                    ) : null}
                    <source src={item.video} type="video/mp4" />
                  </video>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.textBlock}>
            <Text variant="md" muted className={styles.eyebrow}>
              {openingCopy.eyebrow}
            </Text>
            <Heading variant="section" as="h2" className={styles.title}>
              {openingCopy.title}
            </Heading>
            <Text variant="base" className={styles.description}>
              {openingCopy.description}
            </Text>
          </div>

          <Button
            variant="outline"
            className={styles.cta}
            contentClassName={styles.ctaContent}
          >
            {openingCopy.cta}
          </Button>
        </div>

        <div className={styles.navWrap}>
          <NavPill
            label={slide.label}
            onPrev={goPrev}
            onNext={goNext}
            variant="light"
          />
        </div>
      </div>

      <div className={styles.bottomFade} aria-hidden />
    </section>
  );
}
