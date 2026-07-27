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
 *
 * Two things about the *controls* are load-bearing, both from review #12:
 *
 * 1. Autoplay used to pause on `mouseenter` of this whole `<section>`. At 1440
 *    the section is 1440x888 — it fills the screen — so a desktop pointer left
 *    anywhere on the page while reading held `hovered` true forever and the
 *    slider never advanced. Measured: pointer parked at the section centre, six
 *    seconds, zero advances, scrubber `animation-name: none`. Touch has no
 *    hover, which is exactly why the same build rotated on a phone and looked
 *    dead on a desktop. The pause is now scoped to the indicator alone, which
 *    is the only place a moving target would actually get in the way.
 * 2. The follower slots are real buttons. They used to be `aria-hidden` divs
 *    with no handler, so clicking a photograph — the obvious gesture, and the
 *    one the reviewer tried — did nothing at all; the only manual control was
 *    a 4px dot. Clicking a follower now promotes it into the lead slot, which
 *    is also what "the next image should get bigger" asks for on mobile.
 */
const PHOTOS = careerTeamUp.photos;
const COUNT = PHOTOS.length;
const AUTOPLAY_MS = 5000;
const FADE_MS = 700;
const SWIPE_THRESHOLD_PX = 40;
/** A pointer that travelled further than this was a drag, not a tap. */
const TAP_SLOP_PX = 8;

export function JobTeamUp() {
  const sectionRef = useRef<HTMLElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const pointerTravel = useRef(0);
  const [active, setActive] = useState(0);
  // Bumped on every change so the progress animation restarts even when the
  // same slide is re-selected, and so the autoplay timer resets on interaction.
  const [tick, setTick] = useState(0);
  const [holdingControls, setHoldingControls] = useState(false);
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

  const playing = onScreen && !holdingControls && !reducedMotion;

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => go(active + 1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [playing, active, tick, go]);

  // Pointer events cover mouse and touch alike. Nothing calls preventDefault,
  // so vertical page scrolling stays with the browser (`touch-action: pan-y`).
  const handlePointerDown = (event: React.PointerEvent) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
    pointerTravel.current = 0;
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    pointerTravel.current = Math.hypot(dx, dy);
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) {
      return;
    }
    go(active + (dx < 0 ? 1 : -1), true);
  };

  // A swipe that ends over a follower still emits a click; only a real tap may
  // promote the slot.
  const handleSlotClick = (slot: number) => {
    if (pointerTravel.current > TAP_SLOP_PX) return;
    go(active + slot, true);
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
            {PHOTOS.map((_, slot) => {
              const shown = PHOTOS[(active + slot) % COUNT];
              const layers = PHOTOS.map((photo, index) => (
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
                    draggable={false}
                  />
                </div>
              ));

              // The lead slot already shows what it would select, so it stays
              // inert; the followers are the control.
              if (slot === 0) {
                return (
                  <div
                    key={slot}
                    className={[styles.teamUpCard, styles.teamUpCardLarge].join(
                      " ",
                    )}
                    aria-hidden
                  >
                    {layers}
                  </div>
                );
              }

              return (
                <button
                  key={slot}
                  type="button"
                  className={[
                    styles.teamUpCard,
                    styles.teamUpCardSmall,
                    styles.teamUpCardButton,
                  ].join(" ")}
                  onClick={() => handleSlotClick(slot)}
                  aria-label={`Show ${shown.title}`}
                >
                  {layers}
                </button>
              );
            })}
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
              // Scoped pause: only the indicator holds the slider, so the dot
              // being aimed at stays put. Hovering the photographs no longer
              // stalls autoplay — that was review #12's whole failure.
              onMouseEnter={() => setHoldingControls(true)}
              onMouseLeave={() => setHoldingControls(false)}
              onFocusCapture={() => setHoldingControls(true)}
              onBlurCapture={() => setHoldingControls(false)}
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
