"use client";

import Image from "next/image";
import { useMemo } from "react";
import { resolveHeroBackgroundRenderLayers } from "@/lib/hero-background";
import {
  HERO_BG_CROSSFADE_MS,
  heroCarouselDestinations,
  type HeroBackgroundMix,
} from "@/lib/hero-carousel";
import styles from "./hero-section.module.css";

type HeroMobileBackgroundProps = {
  bgMix: HeroBackgroundMix;
  ready: boolean;
  isScrolling: boolean;
};

export function HeroMobileBackground({
  bgMix,
  ready,
  isScrolling,
}: HeroMobileBackgroundProps) {
  const renderLayers = useMemo(
    () =>
      resolveHeroBackgroundRenderLayers(
        bgMix,
        heroCarouselDestinations.length,
      ),
    [bgMix],
  );

  const transitionStyle = isScrolling
    ? "none"
    : `opacity ${HERO_BG_CROSSFADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;

  return (
    <div
      className={[styles.bgWrap, ready ? styles.bgWrapReady : ""]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      {renderLayers.map((layer) => (
        <Image
          key={`hero-bg-${heroCarouselDestinations[layer.index].id}`}
          src={heroCarouselDestinations[layer.index].bg}
          alt=""
          fill
          priority={layer.index <= 1}
          loading={layer.index <= 1 ? undefined : "eager"}
          className={styles.bg}
          sizes="100vw"
          style={{
            opacity: layer.opacity,
            zIndex: layer.zIndex,
            transition: transitionStyle,
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}
