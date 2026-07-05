"use client";

import { GlassSurface } from "@/design-system/liquid-glass";
import styles from "./components.module.css";

export interface TabProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Tab({ label, active = false, onClick, className = "" }: TabProps) {
  if (active) {
    return (
      <span
        className={[styles.tab, styles.tabActive, className].filter(Boolean).join(" ")}
        aria-selected
      >
        {label}
      </span>
    );
  }

  return (
    <GlassSurface
      preset="pill"
      height={36}
      radius={16}
      className={[styles.tab, styles.tabInactive, className].filter(Boolean).join(" ")}
      contentClassName={styles.tabContent}
      onClick={onClick}
      aria-selected={false}
    >
      {label}
    </GlassSurface>
  );
}
