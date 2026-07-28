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
/* Bug #39, the soft featured tile. A `<source>` carries its own `sizes`, and
   these two had none — so the browser fell back to the spec default of `100vw`
   and picked by viewport rather than by the 318-wide tile, pulling the whole
   1070×1337 rendition at 1440. The declarations are the *cover* widths, not the
   box widths: the desktop tile is 318×425 (0.748) against a 1070×1337 source
   (0.800), so the fit is height-driven and needs 425 × 1070/1337 ≈ 341 CSS px,
   where a literal 318 would have under-served it. The band below 1024 is
   width-driven (648 at 768, 346 at 378) and 708 covers it. */
const FEATURED_WIDE_SIZES = "386px";
const FEATURED_BAND_SIZES = "(min-width: 640px) 708px, 426px";

function FeaturedTeamImage() {
  // `quality` is deliberately absent: Next only accepts qualities declared in
// `images.qualities`, and with none configured anything but 75 is rejected
// outright ("q parameter of 80 is not allowed"). The prop was silently
// dropped from the srcSet, so it only ever misdescribed what we serve.
  const shared = { alt: "" } as const;

  const {
    props: { srcSet: wideSrcSet },
  } = getImageProps({
    ...shared,
    sizes: FEATURED_WIDE_SIZES,
    src: images[careerTeams.featured.wideImageKey],
    width: 636,
    height: 850,
  });

  const {
    props: { srcSet: bandSrcSet, ...bandProps },
  } = getImageProps({
    ...shared,
    sizes: FEATURED_BAND_SIZES,
    src: images[careerTeams.featured.imageKey],
    width: 1400,
    height: 1344,
  });

  return (
    <picture>
      <source
        media="(min-width: 1024px)"
        srcSet={wideSrcSet}
        sizes={FEATURED_WIDE_SIZES}
      />
      <source srcSet={bandSrcSet} sizes={FEATURED_BAND_SIZES} />
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
                    sizes="(min-width: 1024px) 480px, (min-width: 640px) 460px, 512px"
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
