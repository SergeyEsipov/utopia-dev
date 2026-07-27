import { careerHero } from "@/lib/career-data";
import styles from "./careers.module.css";

type CareerHeroProps = {
  openPositions?: number | null;
};

/** Figma 24.07 `154:3553` (mobile) / `154:5474` (tablet) / `154:8342` (desktop). */
export function CareerHero({ openPositions }: CareerHeroProps) {
  const eyebrow =
    typeof openPositions === "number"
      ? `${openPositions} open position${openPositions === 1 ? "" : "s"}`
      : careerHero.eyebrow;

  return (
    <section
      className={`${styles.sectionWide} ${styles.heroSection}`}
      aria-labelledby="career-hero-title"
    >
      <div className={`${styles.sectionNarrow} ${styles.hero}`}>
        <div className={styles.heroContent}>
          <p className={`${styles.eyebrowLg} ${styles.heroEyebrow}`}>{eyebrow}</p>
          <h1 id="career-hero-title" className={styles.heroTitle}>
            {careerHero.title}
          </h1>
          <p className={`${styles.bodyMd} ${styles.heroLead}`}>
            {careerHero.description}
          </p>
          <button type="button" className={styles.linkUnderline}>
            {careerHero.learnMoreLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
