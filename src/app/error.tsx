"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./error.module.css";

/**
 * Route-level error boundary. Without it any render error inside a page falls
 * through to `global-error`, which replaces the whole document (nav, menu and
 * all) — this keeps the failure contained and offers a retry.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.description}>
          This page didn&apos;t load as it should. Try again, or head back to
          the start.
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={reset}>
            Try again
          </button>
          <Link href="/" className={styles.secondary}>
            Go home
          </Link>
        </div>

        {error.digest ? (
          <p className={styles.digest}>Reference: {error.digest}</p>
        ) : null}
      </div>
    </main>
  );
}
