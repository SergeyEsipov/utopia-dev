"use client";

import { useEffect, useRef } from "react";

type RevealOptions = {
  threshold?: number;
  rootMargin?: string;
  /** One-shot (default, like mobile v3) vs re-hide when it leaves the viewport. */
  once?: boolean;
};

/**
 * Scroll-reveal, ported from the prototype's reveal.js. Attach the returned ref
 * to a `[data-reveal-group]` element; its `[data-reveal]` children fade/slide up
 * (staggered) once the group scrolls into view. All motion is in reveal.css.
 */
export function useReveal<T extends HTMLElement = HTMLElement>({
  threshold = 0.14,
  rootMargin = "0px 0px -6% 0px",
  once = true,
}: RevealOptions = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const group = ref.current;
    if (!group) return;

    const index = () =>
      group
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((el, i) => el.style.setProperty("--reveal-i", String(i)));
    index();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches || !("IntersectionObserver" in window)) {
      group.classList.add("is-revealed");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            index();
            entry.target.classList.add("is-revealed");
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove("is-revealed");
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(group);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}
