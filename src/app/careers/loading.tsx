import styles from "./loading.module.css";

/**
 * Shown while the careers page awaits the ATS. Deliberately only on this
 * route: it is the one page whose render blocks on a network call, so a
 * root-level loading state would flash on pages that resolve instantly.
 *
 * Mirrors the hero's block rhythm rather than showing a spinner, so the
 * layout does not jump when the real content arrives.
 */
export default function CareersLoading() {
  return (
    <main className={styles.page} aria-busy="true" aria-label="Loading careers">
      <div className={styles.hero}>
        <span className={`${styles.bar} ${styles.eyebrow}`} />
        <span className={`${styles.bar} ${styles.title}`} />
        <span className={`${styles.bar} ${styles.subtitle}`} />
      </div>

      <div className={styles.list}>
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className={`${styles.bar} ${styles.row}`} />
        ))}
      </div>
    </main>
  );
}
