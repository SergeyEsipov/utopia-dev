"use client";

import styles from "./components.module.css";
import { triggerHaptic } from "@/lib/haptics";

export interface CategoryTabsProps {
  items: readonly string[];
  activeIndex?: number;
  onChange?: (index: number) => void;
  variant?: "onDark" | "onLight";
  className?: string;
  /** 0–1 fill progress on the active tab underline. */
  progress?: number;
}

export function CategoryTabs({
  items,
  activeIndex = 0,
  onChange,
  variant = "onLight",
  className = "",
  progress = 0,
}: CategoryTabsProps) {
  const clamp = (value: number) => Math.min(1, Math.max(0, value));

  return (
    <div
      className={[
        styles.categoryTabs,
        variant === "onLight" ? styles.categoryTabsLight : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="tablist"
    >
      {items.map((item, i) => (
        <button
          key={item}
          type="button"
          role="tab"
          aria-selected={i === activeIndex}
          className={[
            styles.categoryTab,
            i === activeIndex ? styles.categoryTabActive : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => {
            if (i !== activeIndex) triggerHaptic("selection");
            onChange?.(i);
          }}
        >
          {item}
          {/* Every tab keeps a persistent fill so the outgoing tab eases to 0
              and the incoming eases up — the CSS transition does the easing. */}
          <span
            className={styles.categoryTabTrack}
            aria-hidden
            style={
              {
                "--tab-progress": i === activeIndex ? clamp(progress) : 0,
              } as React.CSSProperties
            }
          >
            <span className={styles.categoryTabFill} />
          </span>
        </button>
      ))}
    </div>
  );
}
