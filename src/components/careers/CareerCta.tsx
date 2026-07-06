import { careerCta } from "@/lib/career-data";
import { NOT_FOUND_HREF } from "@/lib/routes";
import styles from "./careers.module.css";

export function CareerCta() {
  return (
    <section className={styles.cta} aria-labelledby="career-cta-title">
      <div className={`${styles.sectionNarrow} ${styles.ctaContent}`}>
        <h2 id="career-cta-title" className={styles.displayTitle}>
          {careerCta.title}
        </h2>
        <div className={styles.ctaCopy}>
          <p className={styles.bodyMd}>{careerCta.description}</p>
          <p className={styles.bodySm}>{careerCta.subdescription}</p>
        </div>
        <a href={NOT_FOUND_HREF} className={styles.ctaButton}>
          {careerCta.buttonLabel}
        </a>
      </div>
    </section>
  );
}
