"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Heading, Text, Button, NavPill } from "@/design-system/components";
import { openingCopy, normalizeOpeningSlideIndex } from "@/lib/opening-carousel";
import { triggerHaptic } from "@/lib/haptics";
import { NOT_FOUND_HREF } from "@/lib/routes";
import { useReveal } from "@/hooks/useReveal";
import {
  useOpeningCarousel,
  useOpeningVideo,
} from "./useOpeningCarousel";
import styles from "./opening-section.module.css";

export function OpeningSection() {
  const slidesRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
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

  return (
    <section
      ref={revealRef}
      data-reveal-group
      className={styles.section}
      aria-label="Opening"
    >
      <div className={styles.frame}>
        <div
          ref={slidesRef}
          className={styles.slides}
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

        <div className={styles.content}>
          <div className={styles.textBlock} data-reveal>
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
            onClick={() => {
              triggerHaptic("light");
              router.push(NOT_FOUND_HREF);
            }}
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
