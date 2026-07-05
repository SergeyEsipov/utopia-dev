import styles from "./components.module.css";

export interface ProgressDotsProps {
  total: number;
  current: number;
  className?: string;
}

export function ProgressDots({
  total,
  current,
  className = "",
}: ProgressDotsProps) {
  return (
    <div
      className={[styles.progressDots, className].filter(Boolean).join(" ")}
      role="tablist"
      aria-label="Progress"
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={[
            styles.progressDot,
            i === current ? styles.progressDotActive : "",
          ]
            .filter(Boolean)
            .join(" ")}
          role="tab"
          aria-selected={i === current}
        />
      ))}
    </div>
  );
}
