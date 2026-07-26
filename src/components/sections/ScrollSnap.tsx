"use client";

import { useScrollSnap } from "@/hooks/useScrollSnap";

/**
 * Arms the desktop screen-by-screen snapping over the sections marked with
 * `data-snap-screen` (hero → destinations → opening → private world).
 * Renders nothing; the home page mounts it once.
 */
export function ScrollSnap() {
  useScrollSnap("[data-snap-screen]");
  return null;
}
