"use client";

import { useState } from "react";
import { jobOpeningContent } from "@/lib/career-data";
import { TERMS_HREF } from "@/lib/routes";
import { isPlainClick } from "./ApplyButton";
import { ApplyTermsDialog } from "./ApplyTermsDialog";
import styles from "./job-opening.module.css";

/**
 * The action pair that closes the description card — Figma 24.07 `154:2031`
 * (side by side, 8px apart) / `154:3254` (stacked, the terms link 20px under
 * the button).
 *
 * Both triggers open the same terms interstitial, so they share one dialog.
 * Each stays a real anchor — apply points at the ATS, terms at the terms page —
 * so without JS neither becomes a dead control.
 */
export function ApplyActions({ applyUrl }: { applyUrl: string }) {
  const [open, setOpen] = useState(false);

  const intercept = (event: React.MouseEvent) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    setOpen(true);
  };

  return (
    <div className={styles.cardActions}>
      <a
        href={applyUrl}
        className={styles.cardApply}
        target="_blank"
        rel="noreferrer noopener"
        onClick={intercept}
      >
        {jobOpeningContent.applyLabel}
      </a>
      <a href={TERMS_HREF} className={styles.cardTerms} onClick={intercept}>
        {jobOpeningContent.termsLabel}
      </a>

      <ApplyTermsDialog
        open={open}
        applyUrl={applyUrl}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
