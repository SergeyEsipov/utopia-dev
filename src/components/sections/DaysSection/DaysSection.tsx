"use client";

import Image from "next/image";
import { Heading, Text } from "@/design-system/components";
import { daysSlides } from "@/lib/days-carousel";
import { images } from "@/lib/media";
import { useDaysCarousel } from "./useDaysCarousel";
import styles from "./days-section.module.css";

export function DaysSection() {
  const {
    slide,
    layouts,
    stageHeight,
    isDragging,
    autoplayKey,
    activeIndex,
    goTo,
    goNext,
    goPrev,
    getCardStyle,
    swipeHandlers,
  } = useDaysCarousel();

  return (
    <section className={styles.section} aria-label="Private World">
      <Heading variant="card" as="h2" className={styles.title}>
        Discover Utopia&apos;s
        <br />
        Private World
      </Heading>

      <div className={styles.carousel}>
        <div className={styles.trackWrap}>
          <div
            className={[styles.stage, isDragging ? styles.stageDragging : ""]
              .filter(Boolean)
              .join(" ")}
            style={{ height: stageHeight }}
            {...swipeHandlers}
          >
            <div className={styles.track} style={{ height: stageHeight }}>
              {daysSlides.map((item, i) => {
                const isNext =
                  i === (activeIndex + 1) % daysSlides.length;

                return (
                <article
                  key={item.id}
                  className={[
                    styles.card,
                    layouts[i]?.active ? styles.cardActive : "",
                    layouts[i]?.active || isNext ? styles.cardTopFade : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={getCardStyle(layouts[i], i)}
                  aria-hidden={!layouts[i]?.active}
                >
                  <Image
                    src={images[item.image]}
                    alt=""
                    fill
                    className={styles.cardImage}
                    sizes="(max-width: 1023px) 276px, 386px"
                    priority={i === 0}
                  />
                </article>
                );
              })}
            </div>

            <button
              type="button"
              className={[styles.hit, styles.hitPrev].filter(Boolean).join(" ")}
              aria-label="Previous slide"
              onClick={goPrev}
            />
            <button
              type="button"
              className={[styles.hit, styles.hitNext].filter(Boolean).join(" ")}
              aria-label="Next slide"
              onClick={goNext}
            />
          </div>
        </div>

        <div className={styles.caption}>
          <div className={styles.captionText}>
            <Text variant="lg" className={styles.captionTitle}>
              {slide.title}
            </Text>
            <Text variant="base" className={styles.captionDesc}>
              {slide.description}
            </Text>
          </div>

          <div
            className={styles.progress}
            role="tablist"
            aria-label="Carousel slides"
          >
            {daysSlides.map((item, i) =>
              i === activeIndex ? (
                <div key={item.id} className={styles.progressItemActive}>
                  <div className={styles.progressTrack}>
                    <div key={autoplayKey} className={styles.progressFill} />
                  </div>
                </div>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={false}
                  className={styles.progressDot}
                  onClick={() => goTo(i)}
                  aria-label={item.title}
                />
              ),
            )}
          </div>
        </div>
      </div>

      <div className={styles.fadeEdgeDesktop} aria-hidden />
    </section>
  );
}
