import Image from "next/image";
import { Heading, Button } from "@/design-system/components";
import { images } from "@/lib/media";
import {
  HeroMobileBackgroundLayer,
  HeroMobileCarouselRoot,
  HeroMobileCarouselTrack,
} from "./HeroMobileCarousel";
import styles from "./hero-section.module.css";

export function HeroSection() {
  return (
    <HeroMobileCarouselRoot>
      <section className={styles.hero} aria-label="Hero">
        <div className={styles.heroMedia}>
          <HeroMobileBackgroundLayer />
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
          </div>
        </div>
      </section>
    </HeroMobileCarouselRoot>
  );
}
