import Image from "next/image";
import { careerTeams } from "@/lib/career-data";
import { images } from "@/lib/media";
import styles from "./careers.module.css";

export function CareerTeams() {
  return (
    <section className={styles.sectionWide} aria-labelledby="career-teams-title">
      <div className={styles.sectionInner}>
        <div className={`${styles.sectionNarrow} ${styles.teamsIntro}`}>
          <h2 id="career-teams-title" className={styles.displayTitle}>
            {careerTeams.heading}
          </h2>
          <div className={styles.teamsCopy}>
            <p className={styles.bodyMd}>{careerTeams.description}</p>
            <p className={styles.bodySm}>{careerTeams.subdescription}</p>
          </div>
        </div>

        <div className={styles.teamsGrid}>
          {careerTeams.items.map((team) => (
            <article key={team.id} className={styles.teamCard}>
              <div className={styles.teamImageWrap}>
                <Image
                  src={images[team.imageKey]}
                  alt=""
                  width={636}
                  height={320}
                  className={styles.teamImage}
                />
              </div>
              <div className={styles.teamInfo}>
                <h3 className={styles.teamName}>{team.name}</h3>
                <p className={styles.teamPositions}>
                  {team.positions} open positions
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
