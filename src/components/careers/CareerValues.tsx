import Image from "next/image";
import { careerValues } from "@/lib/career-data";
import { images } from "@/lib/media";
import styles from "./careers.module.css";

/**
 * Wax-seal artwork, re-exported with transparent backgrounds. The -v2 files
 * are referenced under fresh filenames so the image-optimizer cache can never
 * serve the stale opaque renditions generated from the original paths.
 */
const sealArtwork: Record<
  (typeof careerValues.items)[number]["imageKey"],
  string
> = {
  careerValueNeverSettle: "/assets/careers/value-never-settle.png",
  careerValueDreamTeam: "/assets/careers/value-dream-team.png",
  careerValueThinkDeeper: "/assets/careers/value-think-deeper.png",
  careerValueGetItDone: "/assets/careers/value-get-it-done.png",
  careerValueDeliverWow: "/assets/careers/value-deliver-wow.png",
};

export function CareerValues() {
  const [first, second, ...rest] = careerValues.items;

  return (
    <section className={styles.sectionWide} aria-labelledby="career-values-title">
      <div className={`${styles.sectionInner} ${styles.values}`}>
        <div className={styles.valuesInner}>
          <div
            className={styles.valuesHero}
            style={{ backgroundImage: `url(${images.careerValuesHero})` }}
          >
            <div className={styles.valuesHeroContent}>
              <h2 id="career-values-title" className={styles.valuesHeroTitle}>
                {careerValues.hero.title}
              </h2>
              <p className={styles.valuesHeroDescription}>
                {careerValues.hero.description}
              </p>
            </div>
          </div>

          <div className={`${styles.valuesRow} ${styles.valuesRowTwo}`}>
            {[first, second].map((value) => (
              <article key={value.id} className={styles.valueCard}>
                <Image
                  src={sealArtwork[value.imageKey]}
                  alt=""
                  width={54}
                  height={56}
                  className={styles.valueIcon}
                />
                <div>
                  <h3 className={styles.valueTitle}>{value.title}</h3>
                  <p className={styles.valueDescription}>{value.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className={`${styles.valuesRow} ${styles.valuesRowThree}`}>
            {rest.map((value) => (
              <article key={value.id} className={styles.valueCard}>
                <Image
                  src={sealArtwork[value.imageKey]}
                  alt=""
                  width={54}
                  height={56}
                  className={styles.valueIcon}
                />
                <div>
                  <h3 className={styles.valueTitle}>{value.title}</h3>
                  <p className={styles.valueDescription}>{value.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
