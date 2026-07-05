"use client";

import Image from "next/image";
import Link from "next/link";
import { Text } from "@/design-system/components";
import { useMenu } from "@/contexts/MenuContext";
import { menuCompanyLinks, menuExperienceLinks } from "@/lib/data";
import { images } from "@/lib/media";
import { DestinationsNav } from "./DestinationsNav";
import styles from "./site-menu.module.css";

export function SiteMenu() {
  const { isOpen, close } = useMenu();

  return (
    <aside
      id="site-menu"
      className={[styles.menu, isOpen ? styles.menuOpen : ""]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={!isOpen}
      aria-label="Site menu"
    >
      <div className={styles.surface}>
        <div className={styles.scroll}>
          <header className={styles.header}>
            <Link
              href="/"
              className={styles.logoLink}
              aria-label="Utopia home"
              onClick={close}
            >
              <Image
                src={images.logoDark}
                alt=""
                width={100}
                height={114}
                className={styles.logo}
                priority
              />
            </Link>
          </header>

          <div className={styles.rule} aria-hidden />

          <nav className={styles.nav} aria-label="Main">
            <div className={styles.navBlock}>
              <Text variant="base" className={styles.label}>
                Destinations
              </Text>
              <DestinationsNav idPrefix="menu" defaultOpen="Tropical" />
            </div>

            <div className={styles.linkGroup}>
              {menuExperienceLinks.map((link) => (
                <Link key={link} href="#" className={styles.link} onClick={close}>
                  {link}
                </Link>
              ))}
            </div>

            <div className={styles.linkGroup}>
              {menuCompanyLinks.map((link) => (
                <Link key={link} href="#" className={styles.link} onClick={close}>
                  {link}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </aside>
  );
}
