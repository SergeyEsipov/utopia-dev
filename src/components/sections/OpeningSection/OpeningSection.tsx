"use client";

import { useRef } from "react";
import { Heading, Text, Button, NavPill } from "@/design-system/components";
import { openingCopy, normalizeOpeningSlideIndex } from "@/lib/opening-carousel";
import { triggerHaptic } from "@/lib/haptics";
import { useReveal } from "@/hooks/useReveal";
import { useFullwidthScale } from "./useFullwidthScale";
import {
  useOpeningCarousel,
  useOpeningVideo,
} from "./useOpeningCarousel";
import styles from "./opening-section.module.css";

export function OpeningSection() {
  const slidesRef = useRef<HTMLDivElement>(null);
  const {
    index,
    loopIndex,
    slide,
    allSlides,
    trackRef,
    isDragging,
    loopJumping,
    goNext,
    goPrev,
    swipeHandlers,
  } = useOpeningCarousel(slidesRef);
  const { setVideoRef } = useOpeningVideo(loopIndex, slidesRef);
  const revealRef = useReveal<HTMLElement>();
  useFullwidthScale(revealRef);

  return (
    <section
      ref={revealRef}
      data-reveal-group
      data-snap-screen="opening"
      className={styles.section}
      aria-label="Opening"
    >
      <div className={styles.frame} data-fullwidth-inner>
        <div
          ref={slidesRef}
          className={styles.slides}
          data-fullwidth-card
          {...swipeHandlers}
        >
          <div
            ref={trackRef}
            className={[
              styles.track,
              isDragging ? styles.trackDragging : "",
              loopJumping ? styles.trackJumping : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {allSlides.map((item, i) => {
              const slideIndex = normalizeOpeningSlideIndex(i);

              return (
              <div
                key={`${item.id}-${i}`}
                className={[styles.slide, i === loopIndex ? styles.slideActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden={i !== loopIndex}
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
                    preload={Math.abs(slideIndex - index) <= 1 ? "auto" : "metadata"}
                    poster={item.poster}
                  >
                    {/* Light encodes (orig clips were 4–6 MB → too heavy to start
                        on phones). iOS picks HEVC, everyone else H.264. */}
                    <source
                      src={item.video.replace(/\.mp4$/, "-mobile.hevc.mp4")}
                      type='video/mp4; codecs="hvc1"'
                    />
                    <source
                      src={item.video.replace(/\.mp4$/, "-mobile.mp4")}
                      type="video/mp4"
                    />
                  </video>
                </div>
              </div>
            );
            })}
          </div>
        </div>

        <div className={styles.content} data-fullwidth-content>
          {/* Four separate rungs on a 140ms ladder, as the prototype animates
              them — not one block. Indices are static: the order never
              changes. */}
          <div className={styles.textBlock}>
            <Text
              variant="md"
              muted
              className={styles.eyebrow}
              data-fullwidth-reveal
              style={{ "--reveal-i": 0 } as React.CSSProperties}
            >
              {openingCopy.eyebrow}
            </Text>
            <Heading
              variant="section"
              as="h2"
              className={styles.title}
              data-fullwidth-reveal
              style={{ "--reveal-i": 1 } as React.CSSProperties}
            >
              {openingCopy.title}
            </Heading>
            <Text
              variant="base"
              className={styles.description}
              data-fullwidth-reveal
              style={{ "--reveal-i": 2 } as React.CSSProperties}
            >
              {openingCopy.description}
            </Text>
          </div>

          <Button
            variant="outline"
            className={styles.cta}
            contentClassName={styles.ctaContent}
            data-fullwidth-reveal
            style={{ "--reveal-i": 3 } as React.CSSProperties}
            // No destination yet — see routes.ts.
            onClick={() => triggerHaptic("light")}
          >
            {openingCopy.cta}
          </Button>
        </div>

        <div className={styles.navWrap} data-fullwidth-nav>
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
