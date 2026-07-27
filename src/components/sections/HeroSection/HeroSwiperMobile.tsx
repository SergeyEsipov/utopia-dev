"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import { Heading, Icon } from "@/design-system/components";
import { heroCarouselDestinations } from "@/lib/hero-carousel";
import { images } from "@/lib/media";
import { triggerHaptic } from "@/lib/haptics";
import { useHeroReducedMotion } from "./useHeroMediaQuery";
import "swiper/css";
import "swiper/css/effect-fade";
import styles from "./hero-swiper-mobile.module.css";

/** desktop_v3 order → Roca centered first. */
const START_INDEX = 0;
const SPEED = 400;
const AUTOPLAY_MS = 4500;

function HeroSlideVideo({
  src,
  poster,
  playing,
  preloadHint,
}: {
  src: string;
  poster: string;
  playing: boolean;
  preloadHint: "auto" | "metadata" | "none";
}) {
  const ref = useRef<HTMLVideoElement>(null);

  // Safari needs these as JS properties, not just attributes, to autoplay.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (!playing) {
      // Same-frame handoff (prototype hero-video.js): keep the outgoing clip
      // painting through the crossfade, pause only once the fade has finished.
      const timer = setTimeout(() => video.pause(), 420);
      return () => clearTimeout(timer);
    }

    // iOS ignores preload="auto"; force the fetch or readyState never rises and
    // play() is stuck waiting (was bug #6: only the still showed on phones).
    if (video.readyState < 2) video.load();

    // Bounded retry: Safari rejects muted autoplay for an element that is not
    // yet visible, so a single play() is silently swallowed.
    let cancelled = false;
    let attempts = 0;
    let retry: ReturnType<typeof setTimeout> | null = null;
    video.currentTime = 0;
    const tryPlay = () => {
      if (cancelled || !video.paused) return;
      const promise = video.play();
      if (!promise) return;
      promise.catch(() => {
        if (cancelled || ++attempts > 10) return;
        retry = setTimeout(tryPlay, 300);
      });
    };
    if (video.readyState >= 2) tryPlay();
    video.addEventListener("canplay", tryPlay);
    return () => {
      cancelled = true;
      if (retry) clearTimeout(retry);
      video.removeEventListener("canplay", tryPlay);
    };
  }, [playing, src]);

  return (
    <video
      ref={ref}
      className={[styles.bgVideo, playing ? styles.bgVideoVisible : ""]
        .filter(Boolean)
        .join(" ")}
      // Landscape first frame so the reveal is a same-frame handoff, not a
      // portrait-photo → landscape-video jump (was bug #1).
      poster={poster}
      muted
      loop
      playsInline
      preload={preloadHint}
      tabIndex={-1}
      aria-hidden
    >
      {/* iOS Safari picks HEVC (~2 MB, 1080p quality); everyone else falls back
          to H.264 (~4 MB). Both far lighter than the 4K desktop clip. */}
      <source
        src={src.replace(/\.mp4$/, ".hevc.mp4")}
        type='video/mp4; codecs="hvc1"'
      />
      <source src={src} type="video/mp4" />
    </video>
  );
}

/**
 * Mobile hero — Swiper rig matching the prototype (v3/js/hero.js): a cards
 * swiper (master) drives a crossfading background swiper (slave), with a
 * per-destination looping video layered over each background photo. Autoplay
 * every 4.5s; inertia drag with edge resistance.
 */
export function HeroSwiperMobile() {
  const bgSwiperRef = useRef<SwiperClass | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(START_INDEX);
  const reducedMotion = useHeroReducedMotion();
  const speed = reducedMotion ? 0 : SPEED;

  // Card width: clamp(260, innerWidth - 64, 314). Figma 44:3283 is 314 wide in
  // a 378 frame — 32px a side, not the prototype's 36 (which gave 306 at 378).
  // The height is not set here: the card stretches to fill the track.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const sync = () => {
      const w = Math.min(314, Math.max(260, Math.round(window.innerWidth - 64)));
      el.style.setProperty("--hero-card-w", `${w}px`);
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, []);

  const handleCardsChange = useCallback((sw: SwiperClass) => {
    const idx = sw.realIndex;
    setActive((prev) => {
      if (prev !== idx) triggerHaptic("navigate");
      return idx;
    });
    const bg = bgSwiperRef.current;
    if (bg && bg.realIndex !== idx) {
      bg.slideToLoop(idx, sw.animating ? SPEED : 0);
    }
  }, []);

  /**
   * The active clip, and metadata for the one autoplay will reach next — the
   * other five stay at "none" until their turn.
   *
   * This used to be "auto" for both neighbours and "metadata" for the rest,
   * which is seven fetches for seven destinations: measured at 378 that pulled
   * ~20 MB of hero clips on one page view, all seven starting inside the same
   * 200ms and then competing. "metadata" is not a cheap probe here — Chrome
   * takes a real chunk of the file for it.
   *
   * The mobile prototype (v3/js/hero-video.js) goes further and mounts a video
   * for the *first destination only*, leaving the other six as stills; keeping
   * a clip per destination is our deviation and is left alone. This changes
   * only when each one is fetched, never whether it exists.
   */
  const count = heroCarouselDestinations.length;
  const preloadFor = (i: number): "auto" | "metadata" | "none" => {
    if (i === active) return "auto";
    if ((i - active + count) % count === 1) return "metadata";
    return "none";
  };

  return (
    <section className={styles.hero} aria-label="Hero" ref={containerRef}>
      <div className={styles.media}>
        <Swiper
          className={styles.bgSwiper}
          modules={[EffectFade]}
          slidesPerView={1}
          loop
          loopAdditionalSlides={2}
          initialSlide={START_INDEX}
          allowTouchMove={false}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={speed}
          onSwiper={(sw) => {
            bgSwiperRef.current = sw;
          }}
        >
          {heroCarouselDestinations.map((d, i) => (
            <SwiperSlide key={d.id} className={styles.bgSlide}>
              <Image
                // Use the poster (= the video's first frame) as the still so it
                // matches the video exactly — no framing jump when it plays.
                src={d.poster}
                alt=""
                fill
                priority={i === START_INDEX}
                sizes="100vw"
                className={styles.bgImage}
              />
              {!reducedMotion ? (
                <HeroSlideVideo
                  // Lightweight 720p encode — the 4K desktop clip is too heavy
                  // to start on phones (was bug #6: only the still showed).
                  src={d.video.replace(/\.mp4$/, "-mobile.mp4")}
                  poster={d.poster}
                  playing={i === active}
                  preloadHint={preloadFor(i)}
                />
              ) : null}
            </SwiperSlide>
          ))}
        </Swiper>
        <div className={styles.gradient} aria-hidden />
      </div>

      <div className={styles.inner}>
        <div className={styles.logoWrap}>
          <Image
            src={images.logo}
            alt="Utopia"
            width={100}
            height={114}
            priority
            className={styles.logo}
          />
        </div>

        <Heading variant="hero" as="h1" inverse className={styles.title}>
          It&apos;s all yours
        </Heading>

        <Swiper
          className={styles.cardsSwiper}
          modules={[Autoplay]}
          slidesPerView="auto"
          centeredSlides
          loop
          loopAdditionalSlides={2}
          initialSlide={START_INDEX}
          spaceBetween={20}
          speed={speed}
          slideToClickedSlide
          grabCursor
          threshold={6}
          touchAngle={40}
          resistanceRatio={0.72}
          autoplay={
            reducedMotion
              ? false
              : {
                  delay: AUTOPLAY_MS,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
          }
          onRealIndexChange={handleCardsChange}
          aria-label="Destinations"
        >
          {heroCarouselDestinations.map((d) => (
            <SwiperSlide key={d.id} className={styles.cardSlide}>
              <div className={styles.card}>
                <div className={styles.caption}>
                  <span>{d.label}</span>
                  <Icon name="chevron" size={12} alt="" />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
