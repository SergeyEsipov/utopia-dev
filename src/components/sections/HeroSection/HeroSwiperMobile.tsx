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
  preloadHint: "auto" | "metadata";
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

  // Card metrics: clamp(260, innerWidth - 72, 314); height keeps the 314:420
  // design ratio (prototype applyHeroCardMetrics).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const sync = () => {
      const w = Math.min(314, Math.max(260, Math.round(window.innerWidth - 72)));
      el.style.setProperty("--hero-card-w", `${w}px`);
      el.style.setProperty("--hero-card-h", `${Math.round((w * 420) / 314)}px`);
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

  // Preload the active clip and its immediate neighbours (metadata for the
  // rest) so the incoming video is already decoded before its layer fades in.
  const count = heroCarouselDestinations.length;
  const preloadFor = (i: number): "auto" | "metadata" => {
    const d = Math.min((i - active + count) % count, (active - i + count) % count);
    return d <= 1 ? "auto" : "metadata";
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
          spaceBetween={14}
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
