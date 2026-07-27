"use client";

import Image from "next/image";
import { useMemo, useRef } from "react";
import { resolveHeroBackgroundRenderLayers } from "@/lib/hero-background";
import { type HeroBackgroundMix } from "@/lib/hero-carousel";
import {
  ECOSYSTEM_CROSSFADE_EASING,
  ECOSYSTEM_CROSSFADE_MS,
  ecosystemSlides,
} from "@/lib/ecosystem-carousel";
import {
  destinationCropAttrs,
  destinationCropStyle,
  destinationSizes,
  getDestinationsFraming,
} from "@/lib/slides-content";
import { useSiteVariantName } from "@/lib/site-variant";
import { useDestinationCrop } from "./useDestinationCrop";
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

  /* Slider-wide fallback framing. Below 1024 — and for the one slide that
     carries no crop — this is still what positions the photo; from 1024 up
     every other slide is placed by its own v10 crop instead, where the crop
     box leaves no vertical slack for `object-position` to act on. */
  const framing = getDestinationsFraming(useSiteVariantName());

  /* The stack is `inset: 0` of the card, so its box *is* the card's box —
     which is what the crop is measured against. */
  const stackRef = useRef<HTMLDivElement>(null);
  useDestinationCrop(stackRef);

  return (
    <div className={styles.bgStack} ref={stackRef} aria-hidden>
      {layers.map((layer) => {
        const item = ecosystemSlides[layer.index];
        return (
          <Image
            key={item.id}
            src={item.bg}
            alt=""
            fill
            className={styles.bgImage}
            /* Not `100vw`: the crop draws this photo at up to 152% of a card
               that is itself up to a full viewport wide, so a 100vw hint had
               the browser fetching a candidate narrower than the box it then
               had to fill. See `destinationSizes`. */
            sizes={destinationSizes(item.crop)}
            priority={layer.index <= 1}
            /* `data-crop` is what opts a slide into the width-anchored box —
               Barcelona alone stays out of it, which v10 leaves as a plain
               bottom-anchored cover. The rest of the attributes carry the
               numbers `useDestinationCrop` reads back. */
            {...destinationCropAttrs(item.crop)}
            style={{
              opacity: layer.opacity,
              zIndex: layer.zIndex,
              transition: transitionStyle,
              objectPosition:
                item.framing?.objectPosition ?? framing.objectPosition,
              pointerEvents: "none",
              ...destinationCropStyle(item.crop),
            }}
          />
        );
      })}
    </div>
  );
}
