"use client";

import Image from "next/image";
import { useMemo } from "react";
import { resolveHeroBackgroundRenderLayers } from "@/lib/hero-background";
import { type HeroBackgroundMix } from "@/lib/hero-carousel";
import {
  ECOSYSTEM_CROSSFADE_EASING,
  ECOSYSTEM_CROSSFADE_MS,
  ecosystemSlides,
} from "@/lib/ecosystem-carousel";
import { getDestinationsFraming } from "@/lib/slides-content";
import { useSiteVariantName } from "@/lib/site-variant";
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

  const transitionStyle = `opacity ${ECOSYSTEM_CROSSFADE_MS}ms ${ECOSYSTEM_CROSSFADE_EASING}`;

  /* The rounded build centres the photo in its card; the sharp build crops it
     full-bleed and taller, so the designers hold it to the bottom edge. The
     two values live with the slides in slides.json. */
  const framing = getDestinationsFraming(useSiteVariantName());

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
            /* The frame is viewport-wide in the sharp build and viewport minus
               gutters in the rounded one, so 100vw is the correct upper bound
               at every width. The old 996/1014 hints predate that. */
            sizes="100vw"
            priority={layer.index <= 1}
            style={{
              opacity: layer.opacity,
              zIndex: layer.zIndex,
              transition: transitionStyle,
              objectPosition: framing.objectPosition,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </div>
  );
}
