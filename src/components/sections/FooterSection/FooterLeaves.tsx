"use client";

import { useEffect, useRef } from "react";

/**
 * Dappled-leaf clip pinned to the footer's bottom edge. Held on its first
 * frame until the footer scrolls into view, then looped; scrolling it back out
 * resets to frame 0 so a later return replays the same "static → motion" beat.
 * Ported from prototype v3/js/footer-video.js + desktop_v9 .footer__bg-video
 * (observes its own parent, so it works for both the mobile and desktop footers).
 */
export function FooterLeaves({
  className,
  hevcSrc,
  mp4Src,
}: {
  className: string;
  hevcSrc: string;
  mp4Src: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const target = video?.parentElement;
    if (!video || !target) return;

    // iOS only honours muted autoplay when the property (not just the
    // attribute) is set before play().
    video.muted = true;

    const toFirstFrame = () => {
      try {
        video.pause();
        video.currentTime = 0;
      } catch {
        /* seek can throw before metadata; harmless */
      }
    };
    const playLoop = () => {
      video.play()?.catch(() => {});
    };

    video.pause();
    if (video.readyState >= 2) toFirstFrame();
    else video.addEventListener("loadeddata", toFirstFrame, { once: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) playLoop();
          else toFirstFrame();
        });
      },
      { threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
    >
      <source src={hevcSrc} type='video/mp4; codecs="hvc1"' />
      <source src={mp4Src} type="video/mp4" />
    </video>
  );
}
