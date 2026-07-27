"use client";

import { useState } from "react";
import { ApplyTermsDialog } from "./ApplyTermsDialog";

type ApplyButtonProps = {
  applyUrl: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * True for a click we are free to intercept. Modified clicks (new tab/window,
 * middle-click) must keep their native behaviour.
 */
export function isPlainClick(event: React.MouseEvent): boolean {
  return !(
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

/**
 * Apply trigger that shows the terms interstitial (Figma 24.07 `154:2258`)
 * before handing off to the ATS.
 *
 * Deliberately still an anchor pointing at the real application URL: the click
 * is intercepted to open the dialog, so with JS unavailable the link keeps
 * working instead of becoming a dead button.
 */
export function ApplyButton({
  applyUrl,
  className,
  children,
}: ApplyButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <a
        href={applyUrl}
        className={className}
        target="_blank"
        rel="noreferrer noopener"
        onClick={(event) => {
          if (!isPlainClick(event)) return;
          event.preventDefault();
          setOpen(true);
        }}
      >
        {children}
      </a>

      <ApplyTermsDialog
        open={open}
        applyUrl={applyUrl}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
