"use client";

import { useEffect, useState } from "react";
import styles from "./cookie-consent.module.css";

const STORAGE_KEY = "utopia-cookie-consent";
/** Let the hero's load intro finish before the card slides in. */
const APPEAR_DELAY_MS = 2200;

type Choice = "accepted" | "rejected";

/**
 * Cookie notice — Figma 24.07 `154:8226`. Sits over the hero, bottom-right on
 * desktop and as a full-width sheet above the dock on mobile.
 *
 * Renders nothing until a choice is known to be absent, so a returning visitor
 * never sees it flash. The choice is stored in localStorage; reading it inside
 * an effect (not during render) keeps the server and first client paint
 * identical.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Private mode / storage disabled — treat as "not decided" but still
      // allow dismissing for the session.
    }
    if (stored === "accepted" || stored === "rejected") return;

    const timer = window.setTimeout(() => setVisible(true), APPEAR_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const decide = (choice: Choice) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* nothing to persist to; the card still closes for this session */
    }
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 400);
  };

  if (!visible) return null;

  return (
    <div
      className={[styles.card, leaving ? styles.cardLeaving : ""]
        .filter(Boolean)
        .join(" ")}
      role="dialog"
      aria-label="Cookies Policy"
    >
      <div className={styles.text}>
        <p className={styles.title}>Cookies Policy</p>
        <p className={styles.body}>
          We use cookies to ensure a seamless experience and to better
          understand how you explore Utopia.
        </p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.button} ${styles.accept}`}
          onClick={() => decide("accepted")}
        >
          Accept
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.reject}`}
          onClick={() => decide("rejected")}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
