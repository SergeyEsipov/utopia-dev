import { careerCta, jobOpeningContent } from "@/lib/career-data";
import { NOT_FOUND_HREF } from "@/lib/routes";
import styles from "./job-opening.module.css";

/**
 * Job-opening variant of the closing CTA (Figma 1:609 / 1:1263 / 1:2945):
 * same copy as the careers CTA, but the button reads "Apply for this role"
 * and the section fades from beige into the page cream.
 */
export function JobCta() {
  return (
    <section className={styles.cta} aria-labelledby="job-cta-title">
      <div className={styles.ctaContent}>
        <h2 id="job-cta-title" className={styles.ctaTitle}>
          {careerCta.title}
        </h2>
        <div className={styles.ctaCopy}>
          <p className={styles.ctaDescription}>{careerCta.description}</p>
          <p className={styles.ctaSubdescription}>{careerCta.subdescription}</p>
        </div>
        <a href={NOT_FOUND_HREF} className={styles.ctaButton}>
          {jobOpeningContent.applyLabel}
        </a>
      </div>
    </section>
  );
}
