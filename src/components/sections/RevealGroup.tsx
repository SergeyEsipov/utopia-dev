"use client";

import { useReveal } from "@/hooks/useReveal";

/**
 * Marks a scroll-reveal group without forcing its (server-rendered) contents to
 * become client components: only this wrapper ships to the browser. Children
 * opt in with `data-reveal`; stagger and timing are tuned per section through
 * --reveal-step / --reveal-delay (see styles/reveal.css).
 */
export function RevealGroup({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} data-reveal-group className={className}>
      {children}
    </div>
  );
}
