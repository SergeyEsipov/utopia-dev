"use client";

import Image from "next/image";
import { Heading, Text, CategoryTabs, NavPill } from "@/design-system/components";
import { ecosystemSlides } from "@/lib/ecosystem-carousel";
import { useEcosystemCarousel } from "./useEcosystemCarousel";
import styles from "./ecosystem-section.module.css";

export function EcosystemSection() {
  const {
    globalIndex,
    categoryIndex,
    categoryProgress,
    slide,
    categoryLabels,
    goNext,
    goPrev,
    goToCategory,
    pause,
    resume,
  } = useEcosystemCarousel();

  return (
    <section className={styles.section} aria-label="Ecosystem">
      <div className={styles.divider} />

      <div className={styles.intro}>
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
          progress={categoryProgress}
          variant="onLight"
          className={styles.tabsDesktop}
        />

        <div
          className={styles.visual}
          onPointerEnter={pause}
          onPointerLeave={resume}
        >
          <div className={styles.bgStack} aria-hidden>
            {ecosystemSlides.map((item, index) => (
              <Image
                key={item.id}
                src={item.bg}
                alt=""
                fill
                className={styles.bgImage}
                sizes="(max-width: 1023px) 100vw, 996px"
                priority={index <= 1}
                style={{
                  opacity: index === globalIndex ? 1 : 0,
                  zIndex: index === globalIndex ? 1 : 0,
                }}
              />
            ))}
          </div>

          <div className={styles.gradient} />

          <CategoryTabs
            items={categoryLabels}
            activeIndex={categoryIndex}
            onChange={goToCategory}
            progress={categoryProgress}
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
