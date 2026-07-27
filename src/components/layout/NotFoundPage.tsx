import Image from "next/image";
import { NotFoundHomeButton } from "@/components/layout/NotFoundHomeButton";
import { SiteDock } from "@/components/layout/SiteDock";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { SiteNav } from "@/components/layout/SiteNav";
import { FooterSection } from "@/components/sections/FooterSection";
import { images } from "@/lib/media";
import styles from "@/app/not-found.module.css";

/**
 * Figma 24.07 `154:8707` (desktop 1440×1460) / `154:5381` (tablet 768×1874) /
 * `154:6614` (mobile 378×1320). All three sit in the "404" group at x=43849,
 * under the `154:1973` label — the desktop frame is still *named* "Terms" in
 * the file, which is why an earlier pass filed it as a stray Terms artboard.
 *
 * A full-bleed photograph with the copy centred over it, then the standard
 * footer. `154:8725` and `154:8738` are hidden alternates still carrying
 * leftover Careers content; the live hero is `154:8708`.
 */
export function NotFoundPage() {
  return (
    <>
      {/* The backdrop runs to the top of the viewport under a transparent bar,
          and it is a bright photograph — hence the dark wordmark. */}
      <SiteNav overlay overlayTone="dark" />
      <main className={styles.page}>
        <section className={styles.hero}>
          <Image
            src={images.notFoundBg}
            alt=""
            fill
            sizes="100vw"
            className={styles.heroImage}
            priority
          />

          <div className={styles.content}>
            <div className={styles.textBlock}>
              <p className={styles.code}>Error 404</p>

              <h1 className={styles.title}>
                This destination doesn&apos;t exist
              </h1>

              <p className={styles.description}>
                The page you&apos;re looking for have been moved or is no longer
                available.
              </p>
            </div>

            <NotFoundHomeButton />
          </div>
        </section>

        <FooterSection />
      </main>
      <SiteMenu />
      <SiteDock />
    </>
  );
}
