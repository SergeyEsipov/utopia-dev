import { careerCta, jobOpeningContent } from "@/lib/career-data";
import { ApplyButton } from "./ApplyButton";
import styles from "./job-opening.module.css";

/**
 * Closing CTA — Figma 24.07 `154:2132` / `154:2860` / `154:3322`. Same copy as
 * the careers CTA over a Beige Dark ground with a cream wash falling out of the
 * top, and a button that runs the same apply flow as the hero.
 */
export function JobCta({ applyUrl }: { applyUrl: string }) {
  return (
    <section className={styles.cta} aria-labelledby="job-cta-title">
      <div className={styles.ctaContent}>
        <div className={styles.ctaCopy}>
          <h2 id="job-cta-title" className={styles.ctaTitle}>
            {careerCta.title}
          </h2>
          <p className={styles.ctaSubdescription}>
            {careerCta.descriptionLead}
            <span className={styles.ctaDescription}>
              {careerCta.descriptionHighlight}
            </span>
            {careerCta.descriptionTail}
          </p>
        </div>
        <ApplyButton applyUrl={applyUrl} className={styles.ctaButton}>
          {jobOpeningContent.applyLabel}
        </ApplyButton>
      </div>
    </section>
  );
}
