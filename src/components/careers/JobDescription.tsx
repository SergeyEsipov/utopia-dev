import { jobOpeningContent } from "@/lib/career-data";
import { NOT_FOUND_HREF, TERMS_HREF } from "@/lib/routes";
import styles from "./job-opening.module.css";

export function JobDescription() {
  return (
    <section className={styles.description} aria-label="Job description">
      <div className={styles.card}>
        {jobOpeningContent.sections.map((section) => (
          <section
            key={section.id}
            className={[
              styles.cardSection,
              section.items ? styles.cardSectionList : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-labelledby={`job-section-${section.id}`}
          >
            <h2 id={`job-section-${section.id}`} className={styles.cardHeading}>
              {section.heading}
            </h2>
            {section.paragraphs ? (
              <div className={styles.cardBody}>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : null}
            {section.items ? (
              <ul className={styles.cardItems}>
                {section.items.map((item) => (
                  <li key={item.title} className={styles.cardItem}>
                    <p className={styles.cardItemTitle}>· {item.title}</p>
                    <p className={styles.cardItemBody}>{item.description}</p>
                  </li>
                ))}
              </ul>
            ) : null}
            {section.bullets ? (
              <ul className={styles.cardBody}>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>· {bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
        <div className={styles.cardActions}>
          <a href={NOT_FOUND_HREF} className={styles.cardApply}>
            {jobOpeningContent.applyLabel}
          </a>
          <a href={TERMS_HREF} className={styles.cardTerms}>
            {jobOpeningContent.termsLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
