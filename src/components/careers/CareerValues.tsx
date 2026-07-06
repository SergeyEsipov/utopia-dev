import Image from "next/image";
import { careerValues } from "@/lib/career-data";
import { images } from "@/lib/media";
import styles from "./careers.module.css";

export function CareerValues() {
  const [first, second, ...rest] = careerValues.items;

  return (
    <section className={styles.sectionWide} aria-labelledby="career-values-title">
      <div className={`${styles.sectionInner} ${styles.values}`}>
        <div className={styles.valuesInner}>
          <div className={styles.valuesHero}>
            <Image
              src={images.careerValuesHero}
              alt=""
              width={1992}
              height={956}
              className={styles.valuesHeroImage}
              priority
            />
            <div className={styles.valuesHeroOverlay} aria-hidden />
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
                  src={images[value.imageKey]}
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
                  src={images[value.imageKey]}
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
