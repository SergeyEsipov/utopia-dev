"use client";

import { Icon } from "./Icon";
import { GlassSurface } from "@/design-system/liquid-glass";
import styles from "./components.module.css";

export interface NavPillProps {
  label: string;
  onPrev?: () => void;
  onNext?: () => void;
  variant?: "light" | "dock";
  className?: string;
}

const BTN = 40;

export function NavPill({
  label,
  onPrev,
  onNext,
  variant = "light",
  className = "",
}: NavPillProps) {
  const preset = variant === "dock" ? "dock" : "pill";

  return (
    <div
      className={[
        styles.navPill,
        variant === "dock" ? styles.navPillDock : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <GlassSurface
        preset={preset}
        height={BTN}
        radius={16}
        className={styles.navPillBtn}
        contentClassName={styles.navPillBtnContent}
        onClick={onPrev}
        aria-label="Previous"
      >
        <Icon
          name="chevronDark"
          size={12}
          alt=""
          className={styles.navPillChevronLeft}
        />
      </GlassSurface>

      <GlassSurface
        as="div"
        preset={preset}
        height={BTN}
        radius={16}
        fullWidth
        interactive={false}
        className={styles.navPillLabel}
        contentClassName={styles.navPillLabelContent}
      >
        {label}
      </GlassSurface>

      <GlassSurface
        preset={preset}
        height={BTN}
        radius={16}
        className={styles.navPillBtn}
        contentClassName={styles.navPillBtnContent}
        onClick={onNext}
        aria-label="Next"
      >
        <Icon name="chevronDark" size={12} alt="" />
      </GlassSurface>
    </div>
  );
}
