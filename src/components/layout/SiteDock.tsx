"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/design-system/components";
import { GlassSurface } from "@/design-system/liquid-glass";
import { useMenu } from "@/contexts/MenuContext";
import { triggerHaptic } from "@/lib/haptics";
import { NOT_FOUND_HREF } from "@/lib/routes";
import styles from "./site-dock.module.css";

const BTN = 40;

export function SiteDock() {
  const { isOpen, toggle } = useMenu();
  const router = useRouter();

  return (
    <div className={styles.dockWrap}>
      <div className={styles.dock}>
        <GlassSurface
          preset="pill"
          height={BTN}
          radius={16}
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
          radius={16}
          fullWidth
          interactive={false}
          className={styles.cta}
          contentClassName={styles.ctaContent}
          onClick={() => {
            triggerHaptic("light");
            router.push(NOT_FOUND_HREF);
          }}
        >
          Request a stay
        </GlassSurface>

        <GlassSurface
          preset="pill"
          height={BTN}
          radius={16}
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
