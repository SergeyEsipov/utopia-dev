import Image, { getImageProps } from "next/image";
import { careerTeams } from "@/lib/career-data";
import { images } from "@/lib/media";
import styles from "./careers.module.css";

/**
 * The featured Hospitality tile is a 318×425 portrait on desktop and a wide
 * 160/200-tall band below that, and Figma gives the two crops *different
 * photographs* (`154:8457` vs `154:3668`). `next/image` has no art-direction
 * API, so the two renditions are composed into a `<picture>` by hand — that
 * way a phone never downloads the desktop plate.
 */
function FeaturedTeamImage() {
  const shared = {
    alt: "",
    quality: 80,
    sizes: "(min-width: 1024px) 318px, (min-width: 640px) 708px, 100vw",
  } as const;

  const {
    props: { srcSet: wideSrcSet },
  } = getImageProps({
    ...shared,
    src: images[careerTeams.featured.wideImageKey],
    width: 636,
    height: 850,
  });

  const {
    props: { srcSet: bandSrcSet, ...bandProps },
  } = getImageProps({
    ...shared,
    src: images[careerTeams.featured.imageKey],
    width: 1400,
    height: 1344,
  });

  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={wideSrcSet} />
      <source srcSet={bandSrcSet} />
      <img {...bandProps} alt="" className={styles.teamImage} />
    </picture>
  );
}

/** Figma 24.07 `154:3654` / `154:5577` / `154:8443`. */
export function CareerTeams() {
  const { featured, items } = careerTeams;

  return (
    <section className={styles.sectionWide} aria-labelledby="career-teams-title">
      <div className={`${styles.sectionInner} ${styles.teams}`}>
        <div className={styles.teamsIntro}>
          <h2 id="career-teams-title" className={styles.displayTitle}>
            {careerTeams.heading}
          </h2>
          <p className={styles.teamsCopy}>
            {careerTeams.description}{" "}
            <span className={styles.teamsCopyRest}>
              {careerTeams.subdescription}
            </span>
          </p>
        </div>

        <div className={styles.teamsGrid}>
          <article className={`${styles.teamCard} ${styles.teamCardFeatured}`}>
            <div className={styles.teamImageWrap}>
              <FeaturedTeamImage />
            </div>
            <div className={styles.teamInfo}>
              <h3 className={styles.teamName}>{featured.name}</h3>
              <p className={styles.teamPositions}>
                {featured.positions} open positions
              </p>
            </div>
          </article>

          <div className={styles.teamsGridRest}>
            {items.map((team) => (
              <article key={team.id} className={styles.teamCard}>
                <div className={styles.teamImageWrap}>
                  <Image
                    src={images[team.imageKey]}
                    alt=""
                    width={692}
                    height={320}
                    sizes="(min-width: 1024px) 319px, (min-width: 640px) 344px, 346px"
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
      </div>
    </section>
  );
}
