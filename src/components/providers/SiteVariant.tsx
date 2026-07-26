"use client";

import { useEffect } from "react";

/**
 * Runtime override for the corner-language variant so the client can compare
 * the two designs by URL: `?variant=rounded` (desktop_v8) or `?variant=sharp`
 * (desktop_v9). Persists the choice for the session so in-app navigation keeps
 * it. The SSR default comes from NEXT_PUBLIC_SITE_VARIANT on <html> in layout.
 */
export function SiteVariant() {
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("variant");
    const stored = sessionStorage.getItem("utopia-variant");
    const variant = param === "rounded" || param === "sharp" ? param : stored;
    if (variant === "rounded" || variant === "sharp") {
      document.documentElement.dataset.variant = variant;
      sessionStorage.setItem("utopia-variant", variant);
    }
  }, []);

  return null;
}
