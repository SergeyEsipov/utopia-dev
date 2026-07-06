"use client";

import { Icon } from "@/design-system/components";
import { GlassSurface } from "@/design-system/liquid-glass";
import { triggerHaptic } from "@/lib/haptics";
import styles from "./footer-scroll-top.module.css";

export function FooterScrollTop() {
  return (
    <GlassSurface
      preset="dock"
      height={38}
      radius={16}
      className={styles.scrollTop}
      contentClassName={styles.scrollTopContent}
      aria-label="Scroll to top"
      onClick={() => {
        triggerHaptic("light");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <Icon name="chevronDark" size={16} alt="" className={styles.scrollTopIcon} />
    </GlassSurface>
  );
}
