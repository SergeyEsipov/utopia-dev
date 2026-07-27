"use client";

import { useRef } from "react";
import { Heading, Text, Button, NavPill } from "@/design-system/components";
import { openingCopy, OPENING_WIDE_BREAKPOINT_PX } from "@/lib/opening-carousel";
import { triggerHaptic } from "@/lib/haptics";
import { useReveal } from "@/hooks/useReveal";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useFullwidthScale } from "./useFullwidthScale";
import {
  useOpeningCarousel,
  useOpeningVideo,
} from "./useOpeningCarousel";
import styles from "./opening-section.module.css";

export function OpeningSection() {
  const slidesRef = useRef<HTMLDivElement>(null);
  const {
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

  /* The section goes full-bleed at 640 (see its stylesheet), and the phone cut
     of these three shots is PORTRAIT — 1076x1924, 1124x1844, 1032x2004. Blown
     across a landscape viewport it was upscaled ~2.4x and cropped to a band.
     Both desktop builds ship a landscape cut of the same footage for exactly
     this reason, so from 640 up that is what we play.
     Safe against the SSR `false` snapshot only because preload is "none": the
     server markup starts no fetch, so the first request is already the right
     tier's file. */
  const wide = useMediaQuery(`(min-width: ${OPENING_WIDE_BREAKPOINT_PX}px)`);

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
              // `key` carries the tier so a width change past 640 remounts the
              // element instead of leaving the old cut's decoded frames in it.
              const tier = wide ? "wide" : "portrait";

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
                    key={tier}
                    ref={setVideoRef(i)}
                    className={styles.bgVideo}
                    muted
                    loop
                    playsInline
                    /* "none", exactly as both prototypes set it. This markup is
                       server-rendered nine times over (three slides x three
                       loop copies), so anything else starts nine downloads the
                       moment the parser reaches the section — measured: nine
                       concurrent requests at 2.1s on slow 3G, none of which
                       ever finished, starving the hero images behind them.
                       `useOpeningVideo` loads the active copy on intersection
                       instead. */
                    preload="none"
                    poster={wide ? item.posterWide : item.poster}
                  >
                    {wide ? (
                      /* Landscape cut, both desktop builds' source order: VP9
                         first (2.7/3.3/5.4 MB), H.264 only as the fallback
                         (14.0/9.6/10.6 MB). */
                      <>
                        <source src={item.videoWideWebm} type="video/webm" />
                        <source src={item.videoWide} type="video/mp4" />
                      </>
                    ) : (
                      /* Portrait cut, light encodes (the originals are 4–6 MB →
                         too heavy to start on phones). iOS picks HEVC,
                         everyone else H.264. */
                      <>
                        <source
                          src={item.video.replace(/\.mp4$/, "-mobile.hevc.mp4")}
                          type='video/mp4; codecs="hvc1"'
                        />
                        <source
                          src={item.video.replace(/\.mp4$/, "-mobile.mp4")}
                          type="video/mp4"
                        />
                      </>
                    )}
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
