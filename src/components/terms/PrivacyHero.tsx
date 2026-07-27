import { privacyHero } from "./privacy-data";
import styles from "./terms.module.css";

export function PrivacyHero() {
  return (
    <section className={styles.hero} aria-labelledby="privacy-hero-title">
      <h1 id="privacy-hero-title" className={styles.heroTitle}>
        {privacyHero.title}
      </h1>
      <p className={styles.heroSubtitle}>{privacyHero.subtitle}</p>
    </section>
  );
}
