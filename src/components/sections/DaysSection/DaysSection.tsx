"use client";

import Image from "next/image";
import { Heading, Text } from "@/design-system/components";
import { daysSlides, DAYS_AUTOPLAY_MS, DAYS_CAPTION_MS, DAYS_TRANSITION_MS } from "@/lib/days-carousel";
import { images } from "@/lib/media";
import { useDaysCarousel } from "./useDaysCarousel";
import styles from "./days-section.module.css";

export function DaysSection() {
  const {
    layouts,
    stageHeight,
    isDragging,
    autoplayKey,
    activeIndex,
    departingIndex,
    goTo,
    goNext,
    goPrev,
    getCardStyle,
    swipeHandlers,
  } = useDaysCarousel();

  const slideCount = daysSlides.length;
  const nextIndex = (activeIndex + 1) % slideCount;
  const prevIndex = (activeIndex - 1 + slideCount) % slideCount;

  return (
    <section className={styles.section} aria-label="Private World">
      <Heading variant="card" as="h2" className={styles.title}>
        Discover Utopia&apos;s
        <br />
        Private World
      </Heading>

      <div
        className={styles.carousel}
        style={
          {
            "--days-autoplay-ms": `${DAYS_AUTOPLAY_MS}ms`,
            "--days-transition-ms": `${DAYS_TRANSITION_MS}ms`,
            "--days-caption-ms": `${DAYS_CAPTION_MS}ms`,
          } as React.CSSProperties
        }
      >
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
                const isActive = layouts[i]?.active;
                const isDeparting = departingIndex === i;
                const isNext = i === nextIndex;
                const isPrev = i === prevIndex;
                const isClickable = !isActive && (isNext || isPrev);

                return (
                <article
                  key={item.id}
                  className={[
                    styles.card,
                    isActive ? styles.cardActive : "",
                    isActive && !isDeparting ? styles.cardTopFade : "",
                    isDeparting ? styles.cardDeparting : "",
                    isNext ? styles.cardNext : "",
                    isPrev ? styles.cardPrev : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={getCardStyle(layouts[i], i)}
                  aria-hidden={!isActive}
                  aria-label={isClickable ? item.title : undefined}
                  role={isClickable ? "button" : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onPointerDown={(event) => {
                    if (!isClickable) return;
                    event.stopPropagation();
                  }}
                  onClick={() => {
                    if (!isClickable || isDragging) return;
                    if (isNext) goNext();
                    else if (isPrev) goPrev();
                  }}
                  onKeyDown={(event) => {
                    if (!isClickable) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      if (isNext) goNext();
                      else if (isPrev) goPrev();
                    }
                  }}
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
              onClick={() => goPrev()}
            />
            <button
              type="button"
              className={[styles.hit, styles.hitNext].filter(Boolean).join(" ")}
              aria-label="Next slide"
              onClick={() => goNext()}
            />
          </div>
        </div>

        <div className={styles.caption}>
          <div className={styles.captionText}>
            {daysSlides.map((item, i) => (
              <div
                key={item.id}
                className={[
                  styles.captionLayer,
                  i === activeIndex
                    ? styles.captionLayerActive
                    : styles.captionLayerInactive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden={i !== activeIndex}
              >
                <Text variant="lg" className={styles.captionTitle}>
                  {item.title}
                </Text>
                <Text variant="base" className={styles.captionDesc}>
                  {item.description}
                </Text>
              </div>
            ))}
          </div>

          <div
            className={styles.progress}
            role="tablist"
            aria-label="Carousel slides"
          >
            {daysSlides.map((item, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={[
                    styles.progressItem,
                    isActive ? styles.progressItemActive : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => goTo(i, "selection")}
                  aria-label={item.title}
                >
                  <span className={styles.progressTrack}>
                    {isActive ? (
                      <span key={autoplayKey} className={styles.progressFill} />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.fadeEdgeDesktop} aria-hidden />
    </section>
  );
}
