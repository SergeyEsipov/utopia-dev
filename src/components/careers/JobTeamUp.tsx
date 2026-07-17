import Image from "next/image";
import { careerTeamUp } from "@/lib/career-data";
import { images } from "@/lib/media";
import styles from "./job-opening.module.css";

export function JobTeamUp() {
  return (
    <section className={styles.teamUp} aria-labelledby="job-teamup-title">
      <div className={styles.teamUpInner}>
        <div className={styles.teamUpHeader}>
          <h2 id="job-teamup-title" className={styles.teamUpTitle}>
            {careerTeamUp.title}
          </h2>
          <p className={styles.teamUpDescription}>{careerTeamUp.description}</p>
        </div>
        <div className={styles.teamUpBody}>
          <div className={styles.teamUpTrack}>
            {careerTeamUp.photos.map((photo) => (
              <div
                key={photo.id}
                className={[
                  styles.teamUpCard,
                  photo.variant === "large"
                    ? styles.teamUpCardLarge
                    : styles.teamUpCardSmall,
                ].join(" ")}
              >
                <Image
                  src={images[photo.imageKey]}
                  alt=""
                  fill
                  sizes={
                    photo.variant === "large"
                      ? "(min-width: 768px) 426px, 276px"
                      : "(min-width: 768px) 308px, 184px"
                  }
                  className={styles.teamUpImage}
                />
              </div>
            ))}
          </div>
          <div className={styles.teamUpCaption}>
            <div className={styles.teamUpCaptionCopy}>
              <p className={styles.teamUpCaptionTitle}>
                {careerTeamUp.caption.title}
              </p>
              <p className={styles.teamUpCaptionText}>
                {careerTeamUp.caption.description}
              </p>
            </div>
            <div className={styles.teamUpProgress} aria-hidden>
              <div className={styles.teamUpProgressBar}>
                <span className={styles.teamUpProgressTrack}>
                  <span className={styles.teamUpProgressFill} />
                </span>
                <Image
                  src={images.jobTeamUpDot}
                  alt=""
                  width={4}
                  height={4}
                  className={styles.teamUpDot}
                />
                <Image
                  src={images.jobTeamUpDot}
                  alt=""
                  width={4}
                  height={4}
                  className={styles.teamUpDot}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.teamUpFade} aria-hidden />
    </section>
  );
}
