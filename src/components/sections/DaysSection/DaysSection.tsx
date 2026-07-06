"use client";

import Image from "next/image";
import { Heading, Text } from "@/design-system/components";
import { daysSlides, DAYS_AUTOPLAY_MS, DAYS_CAPTION_MS, DAYS_TRANSITION_MS } from "@/lib/days-carousel";
import { images } from "@/lib/media";
import { useDaysCarousel } from "./useDaysCarousel";
import styles from "./days-section.module.css";

export function DaysSection() {
  const {
    cards,
    stageHeight,
    isDragging,
    autoplayKey,
    activeIndex,
    goTo,
    goNext,
    goPrev,
    swipeHandlers,
  } = useDaysCarousel();

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
              {cards.map((card) => {
                const item = daysSlides[card.slideIndex];

                return (
                <article
                  key={card.key}
                  className={[
                    styles.card,
                    card.active ? styles.cardActive : "",
                    card.active && !card.departing ? styles.cardTopFade : "",
                    card.departing ? styles.cardDeparting : "",
                    card.next ? styles.cardNext : "",
                    card.prev ? styles.cardPrev : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={card.style}
                  aria-hidden={!card.active}
                  aria-label={card.clickable ? item.title : undefined}
                  role={card.clickable ? "button" : undefined}
                  tabIndex={card.clickable ? 0 : undefined}
                  onPointerDown={(event) => {
                    if (!card.clickable) return;
                    event.stopPropagation();
                  }}
                  onClick={() => {
                    if (!card.clickable || isDragging) return;
                    goNext();
                  }}
                  onKeyDown={(event) => {
                    if (!card.clickable) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      goNext();
                    }
                  }}
                >
                  <Image
                    src={images[item.image]}
                    alt=""
                    fill
                    className={styles.cardImage}
                    sizes="(max-width: 1023px) 276px, 386px"
                    priority={card.offset >= 0}
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
