"use client";

import Image from "next/image";
import { useCallback, useId, useState, useSyncExternalStore } from "react";
import { Icon } from "@/design-system/components";
import { careerValues } from "@/lib/career-data";
import { images } from "@/lib/media";
import styles from "./careers.module.css";

/**
 * Wax-seal artwork — small transparent PNGs. Rendered `unoptimized` so the
 * browser loads the raw transparent file directly; the Next image optimizer
 * had cached an opaque (black-flattened) WebP derivative that kept showing a
 * black square behind the seal.
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

/** SSR-safe matchMedia subscription; snapshots false on the server. */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    useCallback(() => window.matchMedia(query).matches, [query]),
    () => false,
  );
}

/**
 * Figma 24.07 `154:3714` / `154:5639` / `154:8552`.
 *
 * Below 640 the five values are an accordion with only the first card open
 * (`154:3719` 196 tall against four 72s); at 640 and up every card shows its
 * body, so the row stops being a button and the chevron disappears. The tree
 * is JS-branched with the wide layout as SSR, the same way the hero picks
 * between its two engines.
 */
export function CareerValues() {
  const isAccordion = useMediaQuery("(max-width: 639px)");
  const [openId, setOpenId] = useState<string>(careerValues.items[0].id);
  const bodyIdPrefix = useId();

  return (
    <section className={styles.sectionWide} aria-labelledby="career-values-title">
      <div className={`${styles.sectionInner} ${styles.values}`}>
        <div className={styles.valuesInner}>
          <div className={styles.valuesHero}>
            {/* Bug #27: this was an inline `background-image` on the div, so
                the raw 2048×2048 source was served unresized and painted in
                bands over the grey fill. The column is 346 / 648 / 996 wide at
                the three tiers, and never grows past 996. */}
            <Image
              src={images.careerValuesHero}
              alt=""
              fill
              sizes="(min-width: 1024px) 996px, (min-width: 640px) 648px, 100vw"
              quality={80}
              className={styles.valuesHeroImage}
            />
            <div className={styles.valuesHeroContent}>
              <h2 id="career-values-title" className={styles.valuesHeroTitle}>
                {careerValues.hero.title}
              </h2>
              <p className={styles.valuesHeroDescription}>
                {careerValues.hero.description}
              </p>
            </div>
          </div>

          <div className={styles.valuesGrid}>
            {careerValues.items.map((value) => {
              const open = !isAccordion || openId === value.id;
              const bodyId = `${bodyIdPrefix}-${value.id}`;

              const seal = (
                <Image
                  src={sealArtwork[value.imageKey]}
                  alt=""
                  width={54}
                  height={56}
                  className={styles.valueIcon}
                  unoptimized
                />
              );

              /* The body stays in the DOM when collapsed (Figma marks
                 `154:3735` hidden rather than absent) so `aria-controls`
                 always resolves; the wrapper collapses its grid row to zero,
                 which is what makes the reveal animate. */
              const copy = (
                <span className={styles.valueCopy}>
                  <span className={styles.valueTitle}>{value.title}</span>
                  <span className={styles.valueBody} aria-hidden={!open}>
                    <span id={bodyId} className={styles.valueDescription}>
                      {value.description}
                    </span>
                  </span>
                </span>
              );

              return (
                <article key={value.id} className={styles.valueCard}>
                  {isAccordion ? (
                    <button
                      type="button"
                      className={`${styles.valueRow} ${open ? styles.valueRowOpen : ""}`}
                      aria-expanded={open}
                      aria-controls={bodyId}
                      onClick={() => setOpenId(open ? "" : value.id)}
                    >
                      {seal}
                      {copy}
                      <span
                        className={`${styles.valueChevron} ${open ? styles.valueChevronOpen : ""}`}
                        aria-hidden
                      >
                        <Icon name="chevronDark" size={13} alt="" />
                      </span>
                    </button>
                  ) : (
                    <div className={styles.valueRow}>
                      {seal}
                      {copy}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
