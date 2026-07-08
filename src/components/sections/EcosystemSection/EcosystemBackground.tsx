"use client";

import Image from "next/image";
import { useMemo } from "react";
import { resolveHeroBackgroundRenderLayers } from "@/lib/hero-background";
import {
  HERO_BG_CROSSFADE_EASING,
  HERO_BG_CROSSFADE_MS,
  type HeroBackgroundMix,
} from "@/lib/hero-carousel";
import { ecosystemSlides } from "@/lib/ecosystem-carousel";
import styles from "./ecosystem-section.module.css";

type EcosystemBackgroundProps = {
  bgMix: HeroBackgroundMix;
};

export function EcosystemBackground({
  bgMix,
}: EcosystemBackgroundProps) {
  const layers = useMemo(
    () => resolveHeroBackgroundRenderLayers(bgMix, ecosystemSlides.length),
    [bgMix],
  );

  const transitionStyle = `opacity ${HERO_BG_CROSSFADE_MS}ms ${HERO_BG_CROSSFADE_EASING}`;

  return (
    <div className={styles.bgStack} aria-hidden>
      {layers.map((layer) => {
        const item = ecosystemSlides[layer.index];
        return (
          <Image
            key={item.id}
            src={item.bg}
            alt=""
            fill
            className={styles.bgImage}
            sizes="(max-width: 1023px) 100vw, 996px"
            priority={layer.index <= 1}
            style={{
              opacity: layer.opacity,
              zIndex: layer.zIndex,
              transition: transitionStyle,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </div>
  );
}
