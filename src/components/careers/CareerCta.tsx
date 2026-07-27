import { careerCta } from "@/lib/career-data";
import styles from "./careers.module.css";

/** Figma 24.07 `154:3797` / `154:5707` / `154:8618`. */
export function CareerCta() {
  return (
    <section className={styles.cta} aria-labelledby="career-cta-title">
      <div className={styles.ctaContent}>
        <div className={styles.ctaCopy}>
          <h2 id="career-cta-title" className={styles.ctaTitle}>
            {careerCta.title}
          </h2>
          <p className={styles.ctaBody}>
            {careerCta.descriptionLead}
            <span className={styles.ctaBodyStrong}>
              {careerCta.descriptionHighlight}
            </span>
            {careerCta.descriptionTail}
          </p>
        </div>
        {/* No destination yet — see routes.ts. */}
        <a className={styles.ctaButton}>{careerCta.buttonLabel}</a>
      </div>
    </section>
  );
}
