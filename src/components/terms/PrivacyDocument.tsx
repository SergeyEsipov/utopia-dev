import { privacyIntro, privacySections } from "./privacy-data";
import styles from "./terms.module.css";

/**
 * Figma 24.07 `154:2584`. Shares `terms.module.css` with the Terms document so
 * the measure (794), the 28px section headings and the 18px body stay in one
 * place — the two pages are typographically the same document.
 *
 * The only structural difference is that Privacy has no group tier, so this
 * renders one flat run of sections instead of Terms' group → subsection nest.
 */
export function PrivacyDocument() {
  return (
    <div className={styles.document}>
      <div className={styles.documentInner}>
        {/* `154:2595` — leads the document without a heading of its own. */}
        <div className={styles.chunk}>
          <div className={styles.chunkBody}>
            <p>{privacyIntro}</p>
          </div>
        </div>

        {privacySections.map((section) => (
          <section
            key={section.id}
            className={styles.subsection}
            aria-labelledby={`privacy-${section.id}`}
          >
            <h2
              id={`privacy-${section.id}`}
              className={styles.subsectionHeading}
            >
              {section.heading}
            </h2>
            <div className={styles.chunk}>
              <div className={styles.chunkBody}>
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
