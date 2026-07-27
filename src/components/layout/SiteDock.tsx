"use client";

import { Icon } from "@/design-system/components";
import { GlassSurface } from "@/design-system/liquid-glass";
import { useMenu } from "@/contexts/MenuContext";
import { triggerHaptic } from "@/lib/haptics";
import styles from "./site-dock.module.css";

const BTN = 40;

export function SiteDock() {
  const { isOpen, toggle } = useMenu();

  return (
    <div className={styles.dockWrap}>
      <div className={styles.dock}>
        <GlassSurface
          preset="pill"
          height={BTN}
          interactive={false}
          className={styles.iconBtn}
          contentClassName={styles.iconBtnContent}
          aria-label="Home"
          onClick={() => {
            triggerHaptic("light");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Icon name="dockMark" size={16} alt="" className={styles.logoMark} />
        </GlassSurface>

        <GlassSurface
          preset="pill"
          height={BTN}
          fullWidth
          interactive={false}
          className={styles.cta}
          contentClassName={styles.ctaContent}
          // No destination yet — see routes.ts.
          onClick={() => triggerHaptic("light")}
        >
          Request a stay
        </GlassSurface>

        <GlassSurface
          preset="pill"
          height={BTN}
          interactive={false}
          className={styles.iconBtn}
          contentClassName={styles.iconBtnContent}
          aria-expanded={isOpen}
          aria-controls="site-menu"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => {
            triggerHaptic("medium");
            toggle();
          }}
        >
          <Icon
            name={isOpen ? "close" : "menu"}
            size={16}
            alt=""
            className={isOpen ? styles.menuIconClose : undefined}
          />
        </GlassSurface>
      </div>
    </div>
  );
}
