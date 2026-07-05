"use client";

import { GlassSurface } from "@/design-system/liquid-glass";
import styles from "./components.module.css";

export interface LocationPillProps {
  label: string;
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

export function LocationPill({
  label,
  active = false,
  className = "",
  onClick,
}: LocationPillProps) {
  if (active) {
    return (
      <span
        className={[
          styles.locationPill,
          styles.locationPillActive,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </span>
    );
  }

  if (onClick) {
    return (
      <GlassSurface
        preset="pill"
        height={36}
        radius={160}
      className={[styles.locationPill, className].filter(Boolean).join(" ")}
      contentClassName={styles.locationPillContent}
      onClick={onClick}
    >
        {label}
      </GlassSurface>
    );
  }

  return (
    <GlassSurface
      as="div"
      preset="pill"
      height={36}
      radius={160}
      interactive={false}
      className={[styles.locationPill, className].filter(Boolean).join(" ")}
      contentClassName={styles.locationPillContent}
    >
      {label}
    </GlassSurface>
  );
}
