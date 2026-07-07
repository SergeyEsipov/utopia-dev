"use client";

import { useEffect } from "react";

/** Locks section height to the initial innerHeight so mobile browser chrome does not resize blocks on scroll. */
export function useStableViewportHeight() {
  useEffect(() => {
    const sync = () => {
      document.documentElement.style.setProperty(
        "--utopia-viewport-height",
        `${window.innerHeight}px`,
      );
    };

    sync();
    window.addEventListener("orientationchange", sync);

    return () => {
      window.removeEventListener("orientationchange", sync);
    };
  }, []);
}
