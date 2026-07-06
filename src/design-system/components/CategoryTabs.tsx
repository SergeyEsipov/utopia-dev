"use client";

import styles from "./components.module.css";
import { triggerHaptic } from "@/lib/haptics";

export interface CategoryTabsProps {
  items: readonly string[];
  activeIndex?: number;
  onChange?: (index: number) => void;
  variant?: "onDark" | "onLight";
  className?: string;
  /** 0–1 fill progress on the active tab underline */
  progress?: number;
  /** Optional animated fill start point for autoplay segments. */
  progressStart?: number;
  /** Optional animated fill end point for autoplay segments. */
  progressEnd?: number;
  progressDurationMs?: number;
  progressAnimationKey?: string | number;
}

export function CategoryTabs({
  items,
  activeIndex = 0,
  onChange,
  variant = "onDark",
  className = "",
  progress = 0,
  progressStart,
  progressEnd,
  progressDurationMs,
  progressAnimationKey,
}: CategoryTabsProps) {
  const clampProgress = (value: number) => Math.min(1, Math.max(0, value));
  const hasProgressAnimation =
    progressStart !== undefined &&
    progressEnd !== undefined &&
    progressDurationMs !== undefined &&
    progressDurationMs > 0;
  const activeProgress = hasProgressAnimation
    ? clampProgress(progressEnd)
    : clampProgress(progress);
  const activeProgressStart = clampProgress(progressStart ?? activeProgress);
  const activeProgressEnd = clampProgress(progressEnd ?? activeProgress);

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
          <span
            className={styles.categoryTabTrack}
            aria-hidden
            style={
              i === activeIndex
                ? ({
                    "--tab-progress": activeProgress,
                    "--tab-progress-start": activeProgressStart,
                    "--tab-progress-end": activeProgressEnd,
                    "--tab-progress-duration": `${progressDurationMs ?? 0}ms`,
                  } as React.CSSProperties)
                : undefined
            }
          >
            {i === activeIndex ? (
              <span
                key={progressAnimationKey}
                className={[
                  styles.categoryTabFill,
                  hasProgressAnimation ? styles.categoryTabFillAnimated : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            ) : null}
          </span>
        </button>
      ))}
    </div>
  );
}
