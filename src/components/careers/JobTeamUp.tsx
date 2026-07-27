"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { careerTeamUp } from "@/lib/career-data";
import { triggerHaptic } from "@/lib/haptics";
import { images } from "@/lib/media";
import styles from "./job-opening.module.css";

/**
 * "Team up with experts" — Figma 24.07 `154:2073`, with `154:2326`
 * ("Desktop - 238") and `154:2357` ("Desktop - 239") giving the two further
 * states.
 *
 * All three frames place the same slots at the same coordinates — a 386x516
 * lead and two 308x412 followers — and differ only in which photograph sits in
 * which. So the *slots* are fixed furniture: nothing resizes, moves or
 * reflows, and advancing only cross-fades a different photo into each one.
 * Every slot therefore carries all three photographs stacked, with opacity
 * picking the current one.
 *
 * The indicator is an autoplay scrubber, which is why Figma draws its fill
 * part-way across (23.744 of 34.287) in all three frames — a mid-cycle capture.
 */
const PHOTOS = careerTeamUp.photos;
const COUNT = PHOTOS.length;
const AUTOPLAY_MS = 5000;
const FADE_MS = 700;
const SWIPE_THRESHOLD_PX = 40;

export function JobTeamUp() {
  const sectionRef = useRef<HTMLElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState(0);
  // Bumped on every change so the progress animation restarts even when the
  // same slide is re-selected, and so the autoplay timer resets on interaction.
  const [tick, setTick] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const go = useCallback((next: number, haptic = false) => {
    if (haptic) triggerHaptic("navigate");
    setActive(((next % COUNT) + COUNT) % COUNT);
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Only run while the section is actually on screen — otherwise the scrubber
  // is counting down against something nobody is looking at.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const playing = onScreen && !hovered && !reducedMotion;

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => go(active + 1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [playing, active, tick, go]);

  // Pointer events cover mouse and touch alike. Nothing calls preventDefault,
  // so vertical page scrolling stays with the browser (`touch-action: pan-y`).
  const handlePointerDown = (event: React.PointerEvent) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) {
      return;
    }
    go(active + (dx < 0 ? 1 : -1), true);
  };

  const current = PHOTOS[active];

  return (
    <section
      ref={sectionRef}
      className={styles.teamUp}
      aria-labelledby="job-teamup-title"
      style={
        {
          "--job-teamup-autoplay": `${AUTOPLAY_MS}ms`,
          "--job-teamup-fade": `${FADE_MS}ms`,
        } as React.CSSProperties
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      <div className={styles.teamUpInner}>
        <div className={styles.teamUpHeader}>
          <h2 id="job-teamup-title" className={styles.teamUpTitle}>
            {careerTeamUp.title}
          </h2>
          <p className={styles.teamUpDescription}>{careerTeamUp.description}</p>
        </div>
        <div className={styles.teamUpBody}>
          <div
            className={styles.teamUpTrack}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              pointerStart.current = null;
            }}
          >
            {PHOTOS.map((_, slot) => (
              <div
                key={slot}
                className={[
                  styles.teamUpCard,
                  slot === 0 ? styles.teamUpCardLarge : styles.teamUpCardSmall,
                ].join(" ")}
                aria-hidden
              >
                {PHOTOS.map((photo, index) => (
                  <div
                    key={photo.id}
                    className={[
                      styles.teamUpPhoto,
                      (active + slot) % COUNT === index
                        ? styles.teamUpPhotoActive
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <Image
                      src={images[photo.imageKey]}
                      alt=""
                      fill
                      sizes={
                        slot === 0
                          ? "(min-width: 1024px) 386px, (min-width: 768px) 426px, 276px"
                          : "(min-width: 768px) 308px, 184px"
                      }
                      className={styles.teamUpImage}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className={styles.teamUpCaption}>
            <div className={styles.teamUpCaptionCopy}>
              {/* Keyed so the copy fades in with the photograph it names. */}
              <div key={current.id} className={styles.teamUpCaptionFade}>
                <p className={styles.teamUpCaptionTitle}>{current.title}</p>
                <p className={styles.teamUpCaptionText}>{current.description}</p>
              </div>
            </div>
            <div
              className={[
                styles.teamUpProgress,
                playing ? styles.teamUpProgressPlaying : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {PHOTOS.map((photo, index) => {
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
                    onClick={() => go(index, true)}
                    aria-label={`Show ${photo.title}`}
                    aria-current={isActive}
                  >
                    <span className={styles.teamUpProgressTrack}>
                      {isActive ? (
                        <span key={tick} className={styles.teamUpProgressFill} />
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
