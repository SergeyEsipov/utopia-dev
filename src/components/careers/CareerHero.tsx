import { careerHero } from "@/lib/career-data";
import styles from "./careers.module.css";

export function CareerHero() {
  return (
    <section className={styles.sectionWide} aria-labelledby="career-hero-title">
      <div className={`${styles.sectionNarrow} ${styles.hero}`}>
        <div className={styles.heroContent}>
          <div className={styles.heroIntro}>
            <p className={styles.eyebrowLg}>{careerHero.eyebrow}</p>
            <h1 id="career-hero-title" className={styles.displayTitle}>
              {careerHero.title}
            </h1>
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.bodyMd}>{careerHero.description}</p>
            <button type="button" className={styles.linkUnderline}>
              {careerHero.learnMoreLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
