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
 * **Gated on the variant: `sharp` steps, `rounded` does not.** No designers'
 * prototype settles it — `grep -i "scroll-snap|data-snap"` over desktop_v8,
 * desktop_v9 and desktop_v10 (index.html and css/style.css) is empty in all
 * three — so it is a design call, carried as `transition.snap` in
 * lib/site-variant. `rounded` (the default) returns null here and mounts no
 * listeners at all.
 */
export function ScrollSnap() {
  const { transition } = useSiteVariant();
  if (!transition.snap) return null;
  return <ScrollSnapEngine transition={transition} />;
}
