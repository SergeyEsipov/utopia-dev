"use client";

import { Icon } from "@/design-system/components";
import { GlassSurface } from "@/design-system/liquid-glass";
import { useMenu } from "@/contexts/MenuContext";
import styles from "./site-dock.module.css";

const BTN = 40;

export function SiteDock() {
  const { isOpen, toggle } = useMenu();

  return (
    <div className={styles.dockWrap}>
      <div className={styles.dock}>
        <GlassSurface
          preset="dock"
          height={BTN}
          radius={16}
          className={styles.iconBtn}
          contentClassName={styles.iconBtnContent}
          aria-label="Home"
        >
          <Icon name="dockMark" size={16} alt="" className={styles.logoMark} />
        </GlassSurface>

        <GlassSurface
          preset="dock"
          height={BTN}
          radius={16}
          fullWidth
          className={styles.cta}
          contentClassName={styles.ctaContent}
        >
          Request a stay
        </GlassSurface>

        <GlassSurface
          preset="dock"
          height={BTN}
          radius={16}
          className={styles.iconBtn}
          contentClassName={styles.iconBtnContent}
          aria-expanded={isOpen}
          aria-controls="site-menu"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={toggle}
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
