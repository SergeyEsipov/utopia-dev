"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { careerTeamUp } from "@/lib/career-data";
import { triggerHaptic } from "@/lib/haptics";
import { images } from "@/lib/media";
import styles from "./job-opening.module.css";

/**
 * "Team up with experts" — Figma 24.07 `154:2073` / `154:2828` / `154:3285`.
 *
 * The photo row is a snap-scrolling track. Two things follow whichever card is
 * currently parked at the start of it: the caption box, which takes that card's
 * width (`154:2091` is 386 under the 386-wide `154:2079`, `154:3311` is 276
 * under the 276-wide `154:3292`), and the indicator, which draws that card as a
 * 34px bar and the rest as 4px dots.
 */
export function JobTeamUp() {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [captionWidth, setCaptionWidth] = useState<number | null>(null);

  // Snapping is `start`-aligned, so the active card is the one whose left edge
  // sits closest to the track's content-box origin.
  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const padding = Number.parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const anchor = track.getBoundingClientRect().left + padding;

    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const distance = Math.abs(card.getBoundingClientRect().left - anchor);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    setActive(bestIndex);
    const card = cardRefs.current[bestIndex];
    setCaptionWidth(
      card ? Math.round(card.getBoundingClientRect().width) : null,
    );
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    sync();

    let idle: ReturnType<typeof setTimeout> | undefined;
    const handleScroll = () => {
      if (idle) clearTimeout(idle);
      idle = setTimeout(sync, 80);
    };

    // The card sizes change at 768 and 1024, so the caption has to be
    // re-measured on resize, not just on scroll.
    const observer = new ResizeObserver(sync);
    observer.observe(track);
    track.addEventListener("scroll", handleScroll, { passive: true });
    track.addEventListener("scrollend", sync);

    return () => {
      if (idle) clearTimeout(idle);
      observer.disconnect();
      track.removeEventListener("scroll", handleScroll);
      track.removeEventListener("scrollend", sync);
    };
  }, [sync]);

  const goTo = (index: number) => {
    const track = trackRef.current;
    const card = cardRefs.current[index];
    if (!track || !card) return;
    triggerHaptic("navigate");
    const padding = Number.parseFloat(getComputedStyle(track).paddingLeft) || 0;
    track.scrollTo({ left: card.offsetLeft - padding, behavior: "smooth" });
  };

  return (
    <section className={styles.teamUp} aria-labelledby="job-teamup-title">
      <div className={styles.teamUpInner}>
        <div className={styles.teamUpHeader}>
          <h2 id="job-teamup-title" className={styles.teamUpTitle}>
            {careerTeamUp.title}
          </h2>
          <p className={styles.teamUpDescription}>{careerTeamUp.description}</p>
        </div>
        <div className={styles.teamUpBody}>
          <div className={styles.teamUpTrack} ref={trackRef}>
            {careerTeamUp.photos.map((photo, index) => (
              <div
                key={photo.id}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                className={[
                  styles.teamUpCard,
                  photo.variant === "large"
                    ? styles.teamUpCardLarge
                    : styles.teamUpCardSmall,
                ].join(" ")}
              >
                <Image
                  src={images[photo.imageKey]}
                  alt=""
                  fill
                  sizes={
                    photo.variant === "large"
                      ? "(min-width: 1024px) 386px, (min-width: 768px) 426px, 276px"
                      : "(min-width: 768px) 308px, 184px"
                  }
                  className={styles.teamUpImage}
                />
              </div>
            ))}
          </div>
          <div
            className={styles.teamUpCaption}
            style={
              captionWidth
                ? ({
                    "--job-teamup-caption-w": `${captionWidth}px`,
                  } as React.CSSProperties)
                : undefined
            }
          >
            <div className={styles.teamUpCaptionCopy}>
              <p className={styles.teamUpCaptionTitle}>
                {careerTeamUp.caption.title}
              </p>
              <p className={styles.teamUpCaptionText}>
                {careerTeamUp.caption.description}
              </p>
            </div>
            <div className={styles.teamUpProgress}>
              {careerTeamUp.photos.map((photo, index) => {
                const isActive = index === active;
                return (
                  <button
                    key={photo.id}
                    type="button"
                    className={[
                      styles.teamUpProgressItem,
                      isActive ? styles.teamUpProgressItemActive : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => goTo(index)}
                    aria-label={`Show photo ${index + 1} of ${careerTeamUp.photos.length}`}
                    aria-current={isActive}
                  >
                    <span className={styles.teamUpProgressTrack}>
                      {isActive ? (
                        <span className={styles.teamUpProgressFill} />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.teamUpFade} aria-hidden />
    </section>
  );
}
