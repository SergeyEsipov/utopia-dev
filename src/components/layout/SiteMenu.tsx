"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMenu } from "@/contexts/MenuContext";
import { footerDestinations, menuFeaturedCard, menuLinks } from "@/lib/data";
import { images } from "@/lib/media";
import { triggerHaptic } from "@/lib/haptics";
import { getCompanyHref } from "@/lib/routes";
import { DestinationsNav } from "./DestinationsNav";
import styles from "./site-menu.module.css";

/**
 * Renders a real <Link> when the page exists and an inert <a> when it does not
 * — same styling either way, no navigation into the 404 (see routes.ts).
 */
function MenuLink({
  href,
  className,
  onClick,
  children,
}: {
  href?: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  if (!href) return <a className={className}>{children}</a>;
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

/**
 * The "Jericoacoara 2027" featured card. Rendered once per layout tier — inside
 * the desktop panel's grid (≥1024) and below the links in the compact tree
 * (640–1023, `.compactCard`) — because Figma places it differently in each:
 * pinned to the right of the columns on desktop (`154:7596`), full width below
 * them on tablet (`154:7851`), and absent on phones (`154:7936`/`154:7993`
 * carry no Pic frame at all). Both copies are in the DOM and CSS hides the
 * wrong one, matching how this file already duplicates the destinations and the
 * secondary links across the two trees.
 *
 * Width comes from the container, never from here — that is what keeps the
 * right edge on the nav bar's close button. No destination yet, so it stays an
 * inert <a> (see routes.ts).
 */
function FeaturedCard({ revealIndex }: { revealIndex?: number }) {
  return (
    <a
      className={styles.card}
      data-menu-reveal
      style={
        revealIndex === undefined
          ? undefined
          : ({ "--reveal-i": revealIndex } as React.CSSProperties)
      }
    >
      {/* Sized in CSS as a percentage of the card, not by these attributes —
          see `.cardImage`. They only give next/image the intrinsic ratio. */}
      <Image
        src={menuFeaturedCard.image}
        alt=""
        width={403}
        height={434}
        sizes="(min-width: 1024px) 420px, 100vw"
        className={styles.cardImage}
      />
      <span className={styles.cardShade} aria-hidden />
      <span className={styles.cardFooter}>
        <span className={styles.cardText}>
          <span className={styles.cardTitle}>{menuFeaturedCard.title}</span>
          <span className={styles.cardSubtitle}>
            {menuFeaturedCard.subtitle}
          </span>
        </span>
        <span className={styles.cardAction} aria-hidden>
          <Image
            src="/assets/menu/card-chevron.svg"
            alt=""
            width={12}
            height={12}
          />
        </span>
      </span>
    </a>
  );
}

const MENU_STAGGER_MS = 1200;
const MENU_CLOSE_MS = 980;

const destinationCategories = Object.keys(
  footerDestinations,
) as (keyof typeof footerDestinations)[];

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

  // Scroll lock. It has to go on <html>, not <body>: globals.css gives both
  // `overflow-x: clip`, and setting `overflow: hidden` on <body> turns *body*
  // into the scroll container — which silently kills `position: sticky` on the
  // nav (the only close affordance ≥1024) and does not actually stop the page
  // scrolling. Locking the root scrolls nothing and leaves sticky intact.
  useEffect(() => {
    if (!isVisible) return;

    const root = document.documentElement;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    const prevOverflow = root.style.overflow;
    const prevPaddingRight = root.style.paddingRight;

    root.style.overflow = "hidden";
    if (scrollbarWidth > 0) root.style.paddingRight = `${scrollbarWidth}px`;
    document.body.classList.add("menu-open");

    return () => {
      root.style.overflow = prevOverflow;
      root.style.paddingRight = prevPaddingRight;
      document.body.classList.remove("menu-open");
    };
  }, [isVisible]);

  // Escape closes it — on desktop the burger is the only other way out.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

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
          {/* ── Mobile / tablet (<1024): stacked accordion ── */}
          <div className={styles.compact}>
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
              <div
                className={[styles.navBlock, styles.navBlockVisible]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* No "Destinations" heading: Figma 24.07 `154:7935` starts
                    straight on the categories. */}
                <DestinationsNav
                  idPrefix="menu"
                  defaultOpen="Tropical"
                  stagger={stagger}
                  exiting={isClosing}
                />
              </div>

              <div
                className={[styles.linkGroup, styles.linkGroupVisible]
                  .filter(Boolean)
                  .join(" ")}
              >
                {menuLinks.map((link) =>
                  "disabled" in link && link.disabled ? (
                    <span
                      key={link.label}
                      className={`${styles.link} ${styles.linkDisabled}`}
                      aria-disabled="true"
                    >
                      {link.label}
                    </span>
                  ) : (
                    <MenuLink
                      key={link.label}
                      href={getCompanyHref(link.label)}
                      className={styles.link}
                      onClick={handleClose}
                    >
                      {link.label}
                    </MenuLink>
                  ),
                )}
              </div>
            </nav>

            {/* Tablet only — CSS hides it below 640, and ≥1024 the whole
                compact tree goes. */}
            <div className={styles.compactCard}>
              <FeaturedCard />
            </div>
          </div>

          {/* ── Desktop (≥1024): prototype desktop_v9 .nav-menu__panel,
                 Figma 24.07 `154:7535` ── */}
          <div className={styles.panel}>
            <div className={styles.panelGrid}>
              <div className={styles.panelLeft}>
                <div className={styles.columns}>
                  {destinationCategories.map((category, i) => (
                    <div
                      key={category}
                      className={styles.column}
                      data-menu-reveal
                      style={{ "--reveal-i": i } as React.CSSProperties}
                    >
                      <p className={styles.columnTitle}>{category}</p>
                      <div className={styles.columnLinks}>
                        {footerDestinations[category].map((item) => (
                          <span
                            key={item.label}
                            className={styles.columnLink}
                            aria-disabled="true"
                          >
                            {item.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div
                    className={styles.column}
                    data-menu-reveal
                    style={{ "--reveal-i": 3 } as React.CSSProperties}
                  >
                    <p className={styles.columnTitle}>Experiences</p>
                    <div className={styles.columnLinks}>
                      <span className={styles.columnLink} aria-disabled="true">
                        Coming soon
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={styles.secondary}
                  data-menu-reveal
                  style={{ "--reveal-i": 4 } as React.CSSProperties}
                >
                  {menuLinks.map((link) =>
                    "disabled" in link && link.disabled ? (
                      <span
                        key={link.label}
                        className={`${styles.secondaryLink} ${styles.secondaryLinkDisabled}`}
                        aria-disabled="true"
                      >
                        {link.label}
                      </span>
                    ) : (
                      <MenuLink
                        key={link.label}
                        href={getCompanyHref(link.label)}
                        className={styles.secondaryLink}
                        onClick={handleClose}
                      >
                        <span>{link.label}</span>
                        <span className={styles.secondaryArrow} aria-hidden>
                          <Image
                            src="/assets/nav-arrow-black.svg"
                            alt=""
                            width={14}
                            height={14}
                          />
                        </span>
                      </MenuLink>
                    ),
                  )}
                </div>
              </div>

              <FeaturedCard revealIndex={5} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
