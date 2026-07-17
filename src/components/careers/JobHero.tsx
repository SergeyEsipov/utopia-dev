import Image from "next/image";
import { jobOpeningContent, type CareerRole } from "@/lib/career-data";
import { images } from "@/lib/media";
import { NOT_FOUND_HREF } from "@/lib/routes";
import styles from "./job-opening.module.css";

export function JobHero({ role }: { role: CareerRole }) {
  return (
    <section className={styles.hero} aria-labelledby="job-hero-title">
      <div className={styles.heroContent}>
        <div className={styles.heroIntro}>
          <div className={styles.heroDetails}>
            <p className={styles.heroDetail}>
              <Image
                src={images.jobOfficeIcon}
                alt=""
                width={20}
                height={20}
                className={styles.heroDetailIcon}
              />
              <span>
                <span className={styles.heroDetailLabel}>Office · </span>
                {role.office}
              </span>
            </p>
            <p className={styles.heroDetail}>
              <Image
                src={images.jobRemoteIcon}
                alt=""
                width={20}
                height={20}
                className={styles.heroDetailIcon}
              />
              <span>
                <span className={styles.heroDetailLabel}>Remote · </span>
                {role.remote}
              </span>
            </p>
          </div>
          <div className={styles.heroCopy}>
            <h1 id="job-hero-title" className={styles.heroTitle}>
              {role.title}
            </h1>
            <p className={styles.heroIntroText}>{jobOpeningContent.intro}</p>
          </div>
        </div>
        <a href={NOT_FOUND_HREF} className={styles.heroApply}>
          {jobOpeningContent.applyLabel}
        </a>
      </div>
    </section>
  );
}
