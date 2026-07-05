import styles from "./components.module.css";

type CardVariant = "default" | "hero" | "opening";

export interface CardProps {
  variant?: CardVariant;
  className?: string;
  children?: React.ReactNode;
}

const variantClass: Record<CardVariant, string> = {
  default: styles.cardDefault,
  hero: styles.cardHero,
  opening: styles.cardOpening,
};

export function Card({
  variant = "default",
  className = "",
  children,
}: CardProps) {
  return (
    <div
      className={[styles.card, variantClass[variant], className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
