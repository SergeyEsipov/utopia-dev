"use client";

import { useLayoutEffect, type RefObject } from "react";
import { DESTINATION_REF_FRAME_ASPECT } from "@/lib/slides-content";

/** Below this the card is the mobile/tablet design and carries no v10 crop. */
const CROP_MIN_WIDTH = 1024;
/** v10's `nudgeMedia`: the hand corrections apply on the wide layout only. */
const NUDGE_MIN_WIDTH = 1441;

/**
 * The vertical half of desktop_v10's per-slide crop — a port of its
 * `applyWidthAnchoredVertical`, down to the ResizeObserver.
 *
 *   mt = topW% · cardW − anchor · (refFrameH − cardH)   [+ nudgeY ≥1441]
 *   mt = min(mt, 0)
 *   minHeight = cardH − mt
 *
 * `topW` is a percentage of the card's **width**, not its height: the numbers
 * were measured against a 1440×680 frame, and driving the vertical off the
 * width is what keeps the visible slice identical at any card aspect ratio.
 * `anchor` then says which edge of that reference frame holds still when the
 * real card is a different height — which ours always is, since it is derived
 * from the viewport.
 *
 * The clamp at 0 is v10's, and it earns its place: without it a tall desktop
 * window (1024×900) leaves a strip of bare card above Cape Town.
 *
 * `minHeight` floors the box at the distance from its own top to the card's
 * bottom, so a photo that is short for its crop can never expose the card
 * underneath; `object-fit: cover` absorbs the extra by cropping the sides, so
 * nothing ever stretches.
 *
 * Why JS at all, when container-query units express the whole thing in CSS:
 * `100cqh` needs `container-type: size` on an ancestor of the photograph, and
 * that containment makes Chrome rasterize it softer — measured on identical
 * pixels at 1440, rendered Laplacian variance 763 with the container against
 * 1062 without, where the prototype scores 1074. See the note in
 * `ecosystem-section.module.css`.
 */
export function useDestinationCrop(stackRef: RefObject<HTMLElement | null>) {
  // No dependency array on purpose: every render can mount a layer or change
  // which slide is on top, and the crop has to be on the element before the
  // browser paints it. The body is a handful of style writes over nine nodes.
  useLayoutEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    const desktop = window.matchMedia(`(min-width: ${CROP_MIN_WIDTH}px)`);
    const wide = window.matchMedia(`(min-width: ${NUDGE_MIN_WIDTH}px)`);

    const apply = () => {
      /* `getBoundingClientRect`, where v10 reads `clientWidth`/`clientHeight`:
         those round to integers, and our card height is derived from the
         viewport, so it is fractional far more often than the prototype's
         was. Measured: the integer read drifts up to 0.28px from the formula
         on a fractional card, the fractional read to 0.02px. */
      const { width: cardW, height: cardH } = stack.getBoundingClientRect();
      const images =
        stack.querySelectorAll<HTMLImageElement>("img[data-crop]");

      for (const img of images) {
        if (!desktop.matches || !cardW || !cardH) {
          // Hand the box back to `next/image`'s own `fill` geometry.
          img.style.top = "";
          img.style.minHeight = "";
          continue;
        }

        const topW = Number(img.dataset.cropTopw ?? 0);
        const anchor = Number(img.dataset.cropAnchor ?? 0.5);
        const nudgeY = wide.matches ? Number(img.dataset.cropNudge ?? 0) : 0;

        const top = Math.min(
          0,
          (topW / 100) * cardW -
            anchor * (DESTINATION_REF_FRAME_ASPECT * cardW - cardH) +
            nudgeY,
        );

        img.style.top = `${top}px`;
        img.style.minHeight = `${Math.max(0, cardH - top)}px`;
      }
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(stack);
    desktop.addEventListener("change", apply);
    wide.addEventListener("change", apply);

    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", apply);
      wide.removeEventListener("change", apply);
    };
  });
}
