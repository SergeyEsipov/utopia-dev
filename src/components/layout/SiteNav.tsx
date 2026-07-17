"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Heading, Icon } from "@/design-system/components";
import { GlassSurface } from "@/design-system/liquid-glass";
import { useMenu, type DesktopMenuPanel } from "@/contexts/MenuContext";
import {
  footerDestinations,
  menuExperienceCards,
  menuFeaturedCard,
  navLinks,
} from "@/lib/data";
import { triggerHaptic } from "@/lib/haptics";
import { getCompanyHref, NOT_FOUND_HREF } from "@/lib/routes";
import styles from "./site-nav.module.css";

/** Exact assets exported from Figma chrome.menuSection (1:3205) */
const menuAssets = {
  leaf: "/assets/menu/menu-leaf.svg",
  wordmark: "/assets/menu/menu-wordmark.svg",
  chevronDown: "/assets/menu/menu-chevron-down.svg",
  linkChevron: "/assets/menu/link-chevron.svg",
  cardChevron: "/assets/menu/card-chevron.svg",
} as const;

const TABLET_BTN = 40;

type SiteNavProps = {
  activeLink?: (typeof navLinks)[number];
};

type MenuCardProps = {
  image: string;
  title: string;
  subtitle: string;
  onNavigate: () => void;
};

function MenuCard({ image, title, subtitle, onNavigate }: MenuCardProps) {
  return (
    <a href={NOT_FOUND_HREF} className={styles.card} onClick={onNavigate}>
      <Image
        src={image}
        alt=""
        fill
        sizes="387px"
        className={styles.cardImage}
      />
      <span className={styles.cardShade} aria-hidden />
      <span className={styles.cardFooter}>
        <span className={styles.cardText}>
          <span className={styles.cardTitle}>{title}</span>
          <span className={styles.cardSubtitle}>{subtitle}</span>
        </span>
        <span className={styles.cardAction} aria-hidden>
          <Image src={menuAssets.cardChevron} alt="" width={12} height={12} />
        </span>
      </span>
    </a>
  );
}

export function SiteNav({ activeLink }: SiteNavProps) {
  const { isOpen, toggle, desktopPanel, toggleDesktopPanel, closeDesktopPanel } =
    useMenu();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    closeDesktopPanel();
  }, [pathname, closeDesktopPanel]);

  useEffect(() => {
    if (!desktopPanel) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDesktopPanel();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [desktopPanel, closeDesktopPanel]);

  useEffect(() => {
    if (!desktopPanel) return;

    // The scrolling element is <html> (globals.css puts overflow-x:hidden on
    // both html and body, so a body overflow lock does nothing). Lock the root
    // and pad for the removed scrollbar to avoid a horizontal content shift.
    const root = document.documentElement;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    const prevOverflow = root.style.overflow;
    const prevPaddingRight = root.style.paddingRight;

    root.style.overflow = "hidden";
    if (scrollbarWidth > 0) root.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      root.style.overflow = prevOverflow;
      root.style.paddingRight = prevPaddingRight;
    };
  }, [desktopPanel]);

  const handleTrigger = (panel: DesktopMenuPanel) => {
    triggerHaptic("light");
    toggleDesktopPanel(panel);
  };

  const categories = Object.keys(
    footerDestinations,
  ) as (keyof typeof footerDestinations)[];

  return (
    <>
      <header
        className={[styles.nav, desktopPanel ? styles.navOpen : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.bar}>
          <div className={styles.left}>
            <Link
              href="/"
              className={styles.leaf}
              aria-label="Utopia home"
              onClick={closeDesktopPanel}
            >
              <Image src={menuAssets.leaf} alt="" width={16} height={23} />
            </Link>
            <button
              type="button"
              className={styles.trigger}
              aria-expanded={desktopPanel === "destinations"}
              aria-controls="site-nav-panel"
              onClick={() => handleTrigger("destinations")}
            >
              Destinations
              <Image
                src={menuAssets.chevronDown}
                alt=""
                width={12}
                height={12}
                className={[
                  styles.triggerChevron,
                  desktopPanel === "destinations"
                    ? styles.triggerChevronOpen
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            </button>
            <button
              type="button"
              className={styles.trigger}
              aria-expanded={desktopPanel === "experiences"}
              aria-controls="site-nav-panel"
              onClick={() => handleTrigger("experiences")}
            >
              Experiences
            </button>
          </div>

          <Link
            href="/"
            className={styles.logo}
            aria-label="Utopia home"
            onClick={closeDesktopPanel}
          >
            <Image
              src={menuAssets.wordmark}
              alt="Utopia"
              width={102}
              height={14}
              priority
            />
          </Link>

          <nav className={styles.right} aria-label="Site links">
            <div className={styles.rightLinks}>
              {navLinks.map((link) => (
                <a
                  key={link}
                  href={getCompanyHref(link)}
                  className={[
                    styles.navLink,
                    activeLink === link ? styles.navLinkActive : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={activeLink === link ? "page" : undefined}
                  onClick={closeDesktopPanel}
                >
                  {link}
                </a>
              ))}
            </div>
            <a href={NOT_FOUND_HREF} className={styles.requestPill}>
              Request a stay
            </a>
          </nav>
        </div>

        <div className={styles.tabletBar}>
          <GlassSurface
            preset="dock"
            height={TABLET_BTN}
            radius={16}
            interactive={false}
            className={styles.tabletBtn}
            contentClassName={styles.tabletBtnContent}
            aria-label="Utopia home"
            onClick={() => {
              triggerHaptic("light");
              router.push("/");
            }}
          >
            <Icon name="dockMark" size={16} alt="" />
          </GlassSurface>

          <Link href="/" className={styles.tabletLogo} aria-label="Utopia home">
            <Image
              src={menuAssets.wordmark}
              alt="Utopia"
              width={102}
              height={14}
              priority
            />
          </Link>

          <GlassSurface
            preset="dock"
            height={TABLET_BTN}
            radius={16}
            interactive={false}
            className={styles.tabletBtn}
            contentClassName={styles.tabletBtnContent}
            aria-expanded={isOpen}
            aria-controls="site-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => {
              triggerHaptic("medium");
              toggle();
            }}
          >
            <Icon name={isOpen ? "close" : "menu"} size={16} alt="" />
          </GlassSurface>
        </div>

        {desktopPanel && (
          <div id="site-nav-panel" className={styles.panel}>
            <div className={styles.panelInner}>
              {desktopPanel === "destinations" ? (
                <>
                  {categories.map((category) => (
                    <div key={category} className={styles.panelColumn}>
                      <Heading
                        variant="section"
                        as="h3"
                        className={styles.panelHeading}
                      >
                        {category}
                      </Heading>
                      <ul className={styles.panelList}>
                        {footerDestinations[category].map((item) => (
                          <li key={item.label}>
                            {"active" in item && item.active ? (
                              <a
                                href={NOT_FOUND_HREF}
                                className={[
                                  styles.panelLink,
                                  styles.panelLinkActive,
                                ].join(" ")}
                                onClick={closeDesktopPanel}
                              >
                                {item.label}
                                <Image
                                  src={menuAssets.linkChevron}
                                  alt=""
                                  width={14}
                                  height={14}
                                />
                              </a>
                            ) : (
                              <span className={styles.panelLink}>
                                {item.label}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <MenuCard
                    image={menuFeaturedCard.image}
                    title={menuFeaturedCard.title}
                    subtitle={menuFeaturedCard.subtitle}
                    onNavigate={closeDesktopPanel}
                  />
                </>
              ) : (
                menuExperienceCards.map((card) => (
                  <MenuCard
                    key={card.title}
                    image={card.image}
                    title={card.title}
                    subtitle={card.subtitle}
                    onNavigate={closeDesktopPanel}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </header>

      {desktopPanel && (
        <div
          className={styles.scrim}
          onClick={closeDesktopPanel}
          aria-hidden="true"
        />
      )}
    </>
  );
}
