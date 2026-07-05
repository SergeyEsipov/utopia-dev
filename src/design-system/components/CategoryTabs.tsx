import styles from "./components.module.css";

export interface CategoryTabsProps {
  items: readonly string[];
  activeIndex?: number;
  onChange?: (index: number) => void;
  variant?: "onDark" | "onLight";
  className?: string;
  /** 0–1 fill progress on the active tab underline */
  progress?: number;
}

export function CategoryTabs({
  items,
  activeIndex = 0,
  onChange,
  variant = "onDark",
  className = "",
  progress = 0,
}: CategoryTabsProps) {
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
          onClick={() => onChange?.(i)}
        >
          {item}
          <span className={styles.categoryTabTrack} aria-hidden>
            {i === activeIndex ? (
              <span
                className={styles.categoryTabFill}
                style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
              />
            ) : null}
          </span>
        </button>
      ))}
    </div>
  );
}
