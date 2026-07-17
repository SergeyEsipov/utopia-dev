"use client";

import Image from "next/image";
import { GlassSurface } from "@/design-system/liquid-glass";
import { triggerHaptic } from "@/lib/haptics";
import styles from "./footer-scroll-top.module.css";

/** Thin up-arrow glyph — exact asset from Figma Arrows instance (1:971 / Q_Icons). */
const ARROW_UP_SRC = "/assets/icons/footer-arrow-up.svg";

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
      <Image src={ARROW_UP_SRC} alt="" width={16} height={16} className={styles.scrollTopIcon} />
    </GlassSurface>
  );
}
