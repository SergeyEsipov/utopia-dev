import { termsHero } from "./terms-data";
import styles from "./terms.module.css";

export function TermsHero() {
  return (
    <section className={styles.hero} aria-labelledby="terms-hero-title">
      <h1 id="terms-hero-title" className={styles.heroTitle}>
        {termsHero.title}
      </h1>
      <p className={styles.heroSubtitle}>{termsHero.subtitle}</p>
    </section>
  );
}
