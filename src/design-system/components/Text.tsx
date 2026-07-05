import styles from "./components.module.css";

type TextVariant = "lg" | "md" | "base" | "sm" | "caption";

const variantClass: Record<TextVariant, string> = {
  lg: styles.textLg,
  md: styles.textMd,
  base: styles.textBase,
  sm: styles.textSm,
  caption: styles.textCaption,
};

type TextTag = "p" | "span" | "div" | "label" | "a";

export interface TextProps {
  variant?: TextVariant;
  as?: TextTag;
  muted?: boolean;
  inverse?: boolean;
  className?: string;
  href?: string;
  children: React.ReactNode;
}

export function Text({
  variant = "base",
  as: Tag = "p",
  muted = false,
  inverse = false,
  className = "",
  href,
  children,
}: TextProps) {
  const colorClass = inverse
    ? styles.textInverse
    : muted
      ? styles.textMuted
      : styles.textPrimary;

  const props = Tag === "a" && href ? { href } : {};

  return (
    <Tag
      {...props}
      className={[variantClass[variant], colorClass, className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}
