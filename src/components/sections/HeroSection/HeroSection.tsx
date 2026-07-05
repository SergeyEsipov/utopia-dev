import Image from "next/image";
import { Heading, Button, Icon } from "@/design-system/components";
import { heroDestinations } from "@/lib/data";
import { images } from "@/lib/media";
import {
  HeroMobileBackground,
  HeroMobileCarouselRoot,
  HeroMobileCarouselTrack,
} from "./HeroMobileCarousel";
import styles from "./hero-section.module.css";

function HeroCard({
  label,
  size,
  featured,
}: {
  label: string;
  size: "sm" | "md";
  featured?: boolean;
}) {
  return (
    <div
      className={[
        styles.card,
        featured ? styles.cardFeatured : "",
        size === "md" ? styles.cardMd : styles.cardSm,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.cardCaption}>
        <span className={size === "md" ? styles.captionMd : styles.captionSm}>
          {label}
        </span>
        <Icon name="chevron" size={12} alt="" />
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <HeroMobileCarouselRoot>
      <section className={styles.hero} aria-label="Hero">
        <div className={styles.mobileCarousel}>
          <HeroMobileBackground />
        </div>

        <div className={styles.bgWrapDesktop}>
          <Image
            src={images.heroBg}
            alt=""
            fill
            priority
            className={styles.bg}
            sizes="(min-width: 1024px) 1392px, 100vw"
          />
        </div>

        <div className={styles.inner}>
          <div className={styles.logoWrap}>
            <Image
              src={images.logo}
              alt="Utopia"
              width={100}
              height={114}
              priority
              className={styles.logo}
            />
          </div>

          <div className={styles.content}>
            <Heading variant="hero" as="h1" inverse className={styles.title}>
              It&apos;s all yours
            </Heading>

            <Button variant="primary" className={styles.desktopCta}>
              Request a stay
            </Button>

            <HeroMobileCarouselTrack />

            <div className={styles.cardsDesktop}>
              {heroDestinations.map((dest) => (
                <HeroCard
                  key={dest.id}
                  label={dest.label}
                  size={dest.size}
                  featured={"active" in dest && dest.active}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </HeroMobileCarouselRoot>
  );
}
