"use client";

import { useLayoutEffect, useRef, useState } from "react";
import styles from "./components.module.css";
import { triggerHaptic } from "@/lib/haptics";

export interface CategoryTabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
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
  ...rest
}: CategoryTabsProps) {
  const clamp = (value: number) => Math.min(1, Math.max(0, value));

  /**
   * One indicator that travels between tabs, rather than a fill per tab: the
   * prototype slides a single bar (`left`/`width`, 0.35s) and grows it across
   * the active tab as you advance through that tab's slides. Geometry is
   * measured from the DOM so it follows our flexible tab widths instead of the
   * prototype's fixed 96px columns.
   */
  const listRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    const tab = list?.children[activeIndex];
    if (!list || !(tab instanceof HTMLElement)) return;

    const measure = () =>
      setBar({
        left: tab.offsetLeft,
        width: tab.offsetWidth * clamp(progress),
      });

    measure();
    // Tab widths follow the container, so re-measure when it resizes.
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [activeIndex, progress]);

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
      ref={listRef}
      {...rest}
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
          <span className={styles.categoryTabTrack} aria-hidden />
        </button>
      ))}

      {bar ? (
        <span
          className={styles.categoryTabIndicator}
          aria-hidden
          style={{ left: bar.left, width: bar.width }}
        />
      ) : null}
    </div>
  );
}
