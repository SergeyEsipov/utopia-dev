import styles from "./components.module.css";

type HeadingVariant = "hero" | "section" | "card";
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "span";

const variantClass: Record<HeadingVariant, string> = {
  hero: styles.headingHero,
  section: styles.headingSection,
  card: styles.headingCard,
};

export interface HeadingProps extends React.HTMLAttributes<HTMLElement> {
  variant?: HeadingVariant;
  as?: HeadingTag;
  muted?: boolean;
  inverse?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Heading({
  variant = "section",
  as: Tag = "h2",
  muted = false,
  inverse = false,
  className = "",
  children,
  ...rest
}: HeadingProps) {
  const colorClass = inverse
    ? styles.textInverse
    : muted
      ? styles.textMuted
      : styles.textPrimary;

  return (
    <Tag
      className={[variantClass[variant], colorClass, className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}
