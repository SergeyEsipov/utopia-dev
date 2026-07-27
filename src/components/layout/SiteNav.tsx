"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/design-system/components";
import { GlassSurface } from "@/design-system/liquid-glass";
import { useMenu } from "@/contexts/MenuContext";
import { triggerHaptic } from "@/lib/haptics";
import { useNavSolid } from "./useNavSolid";
import styles from "./site-nav.module.css";

const menuAssets = {
  navWordmark: "/assets/nav-logo-wordmark.svg",
  wordmark: "/assets/menu/menu-wordmark.svg",
} as const;

const TABLET_BTN = 40;

type SiteNavProps = {
  /**
   * Float the bar over a full-bleed hero (home page): fixed, transparent, and
   * flipping to the cream "solid" treatment once the next section reaches the
   * top — prototype desktop_v8/v9 `.nav` / `.nav--solid`, Figma 24.07 states
   * `154:7489` (Closed Hero) and `154:7512` (Closed Main).
   *
   * Pages without a hero leave this off: the bar stays in flow (sticky) and is
   * always solid.
   */
  overlay?: boolean;
  /**
   * Wordmark colour while the bar is transparent. The home hero is dark
   * footage, so the wordmark ships white ("light"). The 404 backdrop
   * (`154:8709`) is a bright photograph and Figma draws `Logo_Text_Black`
   * over it, so that page asks for "dark". Ignored once the bar goes solid —
   * the cream state is always dark-on-cream.
   */
  overlayTone?: "light" | "dark";
};

/**
 * Site header. Both tiers use the model the prototype moved to: wordmark on
 * the left, actions on the right, and a burger that opens the one full-screen
 * SiteMenu. The old desktop-only Destinations/Experiences dropdown panels were
 * dropped in that redesign.
 */
export function SiteNav({
  overlay = false,
  overlayTone = "light",
}: SiteNavProps) {
  const { isOpen, toggle, close } = useMenu();
  const router = useRouter();
  const scrolledPastHero = useNavSolid(overlay);

  // The bar is solid everywhere except while floating over an untouched hero;
  // opening the menu always forces the solid treatment, otherwise a white
  // wordmark would sit on the menu's own cream backdrop.
  const isSolid = !overlay || scrolledPastHero || isOpen;

  return (
    <header
      className={[
        styles.nav,
        overlay ? styles.navOverlay : "",
        overlay && overlayTone === "dark" ? styles.navOverlayDark : "",
        isSolid ? styles.navSolid : "",
        isOpen ? styles.navOpen : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.bar}>
        <Link
          href="/"
          className={styles.logo}
          aria-label="Utopia home"
          onClick={close}
        >
          <Image
            src={menuAssets.navWordmark}
            alt="Utopia"
            width={106}
            height={26}
            priority
          />
        </Link>

        <div className={styles.actions}>
          {/* No destination yet: styled as live, does nothing (routes.ts). */}
          <a className={styles.requestPill}>Request a stay</a>
          <button
            type="button"
            className={styles.burger}
            aria-expanded={isOpen}
            aria-controls="site-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => {
              triggerHaptic("medium");
              toggle();
            }}
          >
            <Icon name={isOpen ? "close" : "menu"} size={16} alt="" />
          </button>
        </div>
      </div>

      <div className={styles.tabletBar}>
        <GlassSurface
          preset="dock"
          height={TABLET_BTN}
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
    </header>
  );
}
