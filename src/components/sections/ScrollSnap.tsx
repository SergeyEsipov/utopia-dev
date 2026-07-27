"use client";

import { useScrollSnap } from "@/hooks/useScrollSnap";
import { useSiteVariant, type SiteVariantConfig } from "@/lib/site-variant";

type SnapTransition = SiteVariantConfig["transition"];

/** Separate component so the hook is not mounted at all when snapping is off. */
function ScrollSnapEngine({ transition }: { transition: SnapTransition }) {
  useScrollSnap("[data-snap-screen]", transition);
  return null;
}

/**
 * Arms the desktop screen-by-screen snapping over the sections marked with
 * `data-snap-screen` (hero → destinations → opening → private world).
 * Renders nothing; the home page mounts it once.
 *
 * **Gated on the variant, and off in `rounded`.** No designers' prototype has
 * step-scrolling — `grep -i "scroll-snap|data-snap"` over desktop_v8,
 * desktop_v9 and desktop_v10 (index.html and css/style.css) is empty in all
 * three — so `rounded` (desktop_v8, the default) scrolls normally and returns
 * null here, mounting no listeners. `sharp` keeps the current behaviour until
 * the client decides; flip `transition.snap` in lib/site-variant to change it.
 */
export function ScrollSnap() {
  const { transition } = useSiteVariant();
  if (!transition.snap) return null;
  return <ScrollSnapEngine transition={transition} />;
}
