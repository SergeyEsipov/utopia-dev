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

    // Whether the footer is currently in view, i.e. whether the clip is *meant*
    // to be running. `loadeddata` needs this: it fires long after the observer
    // has had its say (see below).
    let wantPlay = false;

    const seekToStart = () => {
      try {
        video.currentTime = 0;
      } catch {
        /* seek can throw before metadata; harmless */
      }
    };
    const toFirstFrame = () => {
      video.pause();
      seekToStart();
    };
    const playLoop = () => {
      video.play()?.catch(() => {});
    };

    // On `loadeddata`, seek — but do NOT pause. This is the whole bug: with
    // `preload="none"` nothing loads until something calls play(), so at mount
    // `readyState` is 0 and this listener is always armed. The observer then
    // fires play() when the footer scrolls in, *that* is what starts the load,
    // and `loadeddata` lands afterwards — so a handler that paused killed the
    // playback it had just triggered. Measured before the fix: `readyState: 4`,
    // `paused: true`, `currentTime: 0` at 1440, 768 and 378 alike, which is why
    // the mobile footer was dead too rather than only desktop and tablet.
    // desktop_v9 (the newer prototype) already only seeks here; v3's
    // `footer-video.js`, which this was ported from, calls the pausing variant.
    const onLoadedData = () => {
      seekToStart();
      // Re-issue play() rather than trusting the first call: iOS rejects
      // autoplay on an element with no data yet (same reason the hero videos
      // retry — see CLAUDE.md).
      if (wantPlay) playLoop();
    };

    video.pause();
    if (video.readyState >= 2) seekToStart();
    else video.addEventListener("loadeddata", onLoadedData, { once: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          wantPlay = entry.isIntersecting;
          if (entry.isIntersecting) playLoop();
          else toFirstFrame();
        });
      },
      { threshold: 0 },
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
      video.removeEventListener("loadeddata", onLoadedData);
    };
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
