import Image from "next/image";
import { jobOpeningContent } from "@/lib/career-data";
import { images } from "@/lib/media";
import { ApplyButton } from "./ApplyButton";
import { jobPostingExcerpt, type JobPosting } from "@/lib/revolut-people";
import styles from "./job-opening.module.css";

function locationLine(names: string[]): string {
  if (names.length === 0) return "";
  return names.length === 1 ? names[0] : `${names[0]} +${names.length - 1}`;
}

export function JobHero({ posting }: { posting: JobPosting }) {
  const office = locationLine(posting.offices);
  const remote = locationLine(posting.remote);
  const intro = jobPostingExcerpt(posting, 180);

  return (
    <section className={styles.hero} aria-labelledby="job-hero-title">
      <div className={styles.heroContent}>
        <div className={styles.heroIntro}>
          {office || remote ? (
            <div className={styles.heroDetails}>
              {office ? (
                <p
                  className={styles.heroDetail}
                  title={posting.offices.join(", ")}
                >
                  <Image
                    src={images.jobOfficeIcon}
                    alt=""
                    width={20}
                    height={20}
                    className={styles.heroDetailIcon}
                  />
                  <span>
                    <span className={styles.heroDetailLabel}>Office · </span>
                    {office}
                  </span>
                </p>
              ) : null}
              {remote ? (
                <p
                  className={styles.heroDetail}
                  title={posting.remote.join(", ")}
                >
                  <Image
                    src={images.jobRemoteIcon}
                    alt=""
                    width={20}
                    height={20}
                    className={styles.heroDetailIcon}
                  />
                  <span>
                    <span className={styles.heroDetailLabel}>Remote · </span>
                    {remote}
                  </span>
                </p>
              ) : null}
            </div>
          ) : null}
          <div className={styles.heroCopy}>
            <h1 id="job-hero-title" className={styles.heroTitle}>
              {posting.title}
            </h1>
            {intro ? (
              <p className={styles.heroIntroText}>{intro}</p>
            ) : null}
          </div>
        </div>
        <ApplyButton
          applyUrl={posting.applyUrl}
          className={styles.heroApply}
        >
          {jobOpeningContent.applyLabel}
        </ApplyButton>
      </div>
    </section>
  );
}
