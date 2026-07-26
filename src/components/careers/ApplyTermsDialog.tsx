"use client";

import { useEffect, useRef } from "react";
import { applyTerms } from "@/lib/apply-terms";
import styles from "./apply-terms-dialog.module.css";

type ApplyTermsDialogProps = {
  open: boolean;
  /** Where Accept sends the candidate (the ATS application form). */
  applyUrl: string;
  onClose: () => void;
};

/**
 * Interstitial shown before handing a candidate to the ATS — Figma 24.07
 * `154:2258`. Accept opens the application in a new tab and closes the dialog;
 * Reject and the close button just dismiss it.
 *
 * Built on <dialog> so the browser supplies the modal semantics, focus
 * containment and Escape handling rather than reimplementing them.
 */
export function ApplyTermsDialog({
  open,
  applyUrl,
  onClose,
}: ApplyTermsDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // `close` fires for Escape and for the backdrop-driven close alike, so the
  // parent's state cannot drift out of sync with the element's own.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const accept = () => {
    window.open(applyUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="apply-terms-title"
      // Clicking the backdrop (the dialog element itself, outside the card)
      // dismisses, matching how the overlay reads.
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className={styles.card}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={applyTerms.close}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path
              d="M2 2L14 14M14 2L2 14"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className={styles.text}>
          <h2 id="apply-terms-title" className={styles.title}>
            {applyTerms.title}
          </h2>

          <div>
            {applyTerms.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className={styles.body}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.accept}
            onClick={accept}
            autoFocus
          >
            {applyTerms.accept}
          </button>
          <button type="button" className={styles.reject} onClick={onClose}>
            {applyTerms.reject}
          </button>
        </div>
      </div>
    </dialog>
  );
}
