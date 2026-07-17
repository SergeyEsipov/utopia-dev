"use client";

import { Heading, Text, CategoryTabs, NavPill } from "@/design-system/components";
import { getCategoryProgressRange } from "@/lib/ecosystem-carousel";
import { useReveal } from "@/hooks/useReveal";
import { EcosystemBackground } from "./EcosystemBackground";
import { useEcosystemCarousel } from "./useEcosystemCarousel";
import styles from "./ecosystem-section.module.css";

export function EcosystemSection() {
  const {
    categoryIndex,
    slideIndex,
    slide,
    bgMix,
    categoryLabels,
    goNext,
    goPrev,
    goToCategory,
    swipeHandlers,
  } = useEcosystemCarousel();

  const categoryProgress = getCategoryProgressRange(categoryIndex, slideIndex);
  const revealRef = useReveal<HTMLElement>();

  return (
    <section
      ref={revealRef}
      data-reveal-group
      className={styles.section}
      aria-label="Ecosystem"
    >
      <div className={styles.divider} />

      <div className={styles.intro} data-reveal>
        <Heading variant="section" as="h2" className={styles.heading}>
          Best Spots. Unique Design. Unmatched Service.
        </Heading>
        <Text variant="base" className={styles.subheading}>
          Ultra-luxury private estates for groups and families in the
          world&apos;s ultimate destinations for kitesurfing, surfing, and
          skiing.
        </Text>
      </div>

      <div className={styles.content}>
        <CategoryTabs
          items={categoryLabels}
          activeIndex={categoryIndex}
          onChange={goToCategory}
          progress={categoryProgress.end}
          variant="onLight"
          className={styles.tabsDesktop}
        />

        <div className={styles.visual}>
          <div className={styles.swipeSurface} {...swipeHandlers}>
            <EcosystemBackground bgMix={bgMix} />
            <div className={styles.gradient} />
          </div>

          <CategoryTabs
            items={categoryLabels}
            activeIndex={categoryIndex}
            onChange={goToCategory}
            progress={categoryProgress.end}
            variant="onDark"
            className={styles.tabsMobile}
          />

          <div className={styles.navWrap}>
            <NavPill
              label={slide.label}
              onPrev={goPrev}
              onNext={goNext}
              variant="light"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
