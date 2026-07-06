"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Text } from "@/design-system/components";
import { useMenu } from "@/contexts/MenuContext";
import { menuCompanyLinks, menuExperienceLinks } from "@/lib/data";
import { images } from "@/lib/media";
import { triggerHaptic } from "@/lib/haptics";
import { NOT_FOUND_HREF, getCompanyHref } from "@/lib/routes";
import { DestinationsNav } from "./DestinationsNav";
import styles from "./site-menu.module.css";

const MENU_STAGGER_MS = 1200;
const MENU_CLOSE_MS = 980;

export function SiteMenu() {
  const { isOpen, close } = useMenu();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [stagger, setStagger] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setIsVisible(true);
      return;
    }

    if (!isVisible) return;

    setIsClosing(true);
    setStagger(false);

    const timer = window.setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, MENU_CLOSE_MS);

    return () => window.clearTimeout(timer);
  }, [isOpen, isVisible]);

  useEffect(() => {
    if (!isOpen || isClosing) {
      setStagger(false);
      return;
    }

    setStagger(true);
    const timer = window.setTimeout(() => setStagger(false), MENU_STAGGER_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen, isClosing]);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("menu-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("menu-open");
    }

    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("menu-open");
    };
  }, [isVisible]);

  const handleClose = () => {
    triggerHaptic("light");
    close();
  };

  if (!isVisible) return null;

  const isEntering = isOpen && !isClosing;

  return (
    <aside
      id="site-menu"
      className={[
        styles.menu,
        styles.menuVisible,
        isEntering ? styles.menuOpen : "",
        isClosing ? styles.menuClosing : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={isClosing}
      aria-label="Site menu"
    >
      <div className={styles.surface}>
        <div className={styles.scroll}>
          <header className={styles.header}>
            <Link
              href="/"
              className={styles.logoLink}
              aria-label="Utopia home"
              onClick={handleClose}
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
            <div className={[styles.navBlock, styles.navBlockVisible]
              .filter(Boolean)
              .join(" ")}
            >
              <Text variant="base" className={styles.label}>
                Destinations
              </Text>
              <DestinationsNav
                idPrefix="menu"
                defaultOpen="Tropical"
                stagger={stagger}
                exiting={isClosing}
              />
            </div>

            <div className={[styles.linkGroup, styles.linkGroupVisible]
              .filter(Boolean)
              .join(" ")}
            >
              {menuExperienceLinks.map((link) => (
                <Link key={link} href={NOT_FOUND_HREF} className={styles.link} onClick={handleClose}>
                  {link}
                </Link>
              ))}
            </div>

            <div className={[styles.linkGroup, styles.linkGroupVisible]
              .filter(Boolean)
              .join(" ")}
            >
              {menuCompanyLinks.map((link) => (
                <Link key={link} href={getCompanyHref(link)} className={styles.link} onClick={handleClose}>
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
