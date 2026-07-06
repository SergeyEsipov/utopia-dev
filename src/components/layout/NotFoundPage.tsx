import Image from "next/image";
import Link from "next/link";
import { Heading, Text } from "@/design-system/components";
import { NotFoundHomeButton } from "@/components/layout/NotFoundHomeButton";
import { SiteDock } from "@/components/layout/SiteDock";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { SiteNav } from "@/components/layout/SiteNav";
import { images } from "@/lib/media";
import styles from "@/app/not-found.module.css";

export function NotFoundPage() {
  return (
    <>
      <SiteNav />
      <main className={styles.page}>
        <div className={styles.divider} aria-hidden />

        <div className={styles.content}>
          <Link href="/" aria-label="Utopia home">
            <Image
              src={images.logoDark}
              alt=""
              width={64}
              height={73}
              className={styles.emblem}
              priority
            />
          </Link>

          <Text variant="sm" className={styles.code}>
            404
          </Text>

          <Heading variant="section" as="h1" className={styles.title}>
            This destination doesn&apos;t exist
          </Heading>

          <Text variant="base" muted className={styles.description}>
            The page you&apos;re looking for may have moved or is no longer
            available.
          </Text>

          <div className={styles.actions}>
            <NotFoundHomeButton />
          </div>
        </div>
      </main>
      <SiteMenu />
      <SiteDock />
    </>
  );
}
