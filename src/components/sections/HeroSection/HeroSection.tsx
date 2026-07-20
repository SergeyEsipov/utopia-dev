"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Heading } from "@/design-system/components";
import { images } from "@/lib/media";
import {
  HeroMobileBackgroundLayer,
  HeroMobileCarouselRoot,
  HeroMobileCarouselTrack,
} from "./HeroMobileCarousel";
import { HeroRequestCta } from "./HeroRequestCta";
import { HeroSwiperMobile } from "./HeroSwiperMobile";
import { useHeroSettle } from "./useHeroSettle";
import styles from "./hero-section.module.css";

export function HeroSection() {
  // Mobile runs the Swiper rig (prototype v3); desktop keeps the card layout.
  // SSR/first render is the desktop tree; mobile swaps in after mount.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // The pin supplies the scroll runway the sticky hero settles across (≥1024).
  const pinRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  useHeroSettle(pinRef, heroRef, !isMobile);

  if (isMobile) return <HeroSwiperMobile />;

  return (
    <HeroMobileCarouselRoot>
      <div ref={pinRef} className={styles.heroPin}>
        <section ref={heroRef} className={styles.hero} aria-label="Hero">
          <div className={styles.heroMedia}>
            <HeroMobileBackgroundLayer />

            <div className={styles.inner}>
              <div className={styles.logoWrap}>
                {/* Mobile hero (Figma 1:2672) keeps the leaf + UTOPIA wordmark */}
                <Image
                  src={images.logo}
                  alt="Utopia"
                  width={100}
                  height={114}
                  priority
                  className={styles.logo}
                />
                {/* Desktop hero (Figma 1:845 logo_icon) is the leaf mark only —
                  the wordmark stays in the nav bar */}
                <Image
                  src={images.heroLogoIconDesktop}
                  alt="Utopia"
                  width={100}
                  height={100}
                  priority
                  className={styles.logoDesktop}
                />
              </div>

              <div className={styles.content}>
                <Heading
                  variant="hero"
                  as="h1"
                  inverse
                  className={styles.title}
                >
                  It&apos;s all yours
                </Heading>

                <HeroRequestCta className={styles.desktopCta} />
              </div>

              <HeroMobileCarouselTrack />
            </div>
          </div>
        </section>
      </div>
    </HeroMobileCarouselRoot>
  );
}
