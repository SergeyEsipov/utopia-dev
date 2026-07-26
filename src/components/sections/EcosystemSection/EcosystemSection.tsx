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
      data-snap-screen="destinations"
      className={styles.section}
      aria-label="Ecosystem"
    >
      <div className={styles.divider} />

      {/* Title, body and the filter row each take their own slot in the
          140ms ladder — the prototype reveals them i=0/1/2, not as one block.
          The image is deliberately exempt (it must never fade in). */}
      <div className={styles.intro}>
        <Heading variant="section" as="h2" className={styles.heading} data-reveal>
          Best Spots. Unique Design. Unmatched Service.
        </Heading>
        <Text variant="base" className={styles.subheading} data-reveal>
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
          data-reveal
        />

        <div className={styles.visual} data-scale-seed>
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
