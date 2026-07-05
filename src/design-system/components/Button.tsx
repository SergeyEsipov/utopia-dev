"use client";

import { GlassSurface } from "@/design-system/liquid-glass";
import styles from "./components.module.css";

type ButtonVariant = "primary" | "ghost" | "outline";
type ButtonSize = "md" | "sm";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  contentClassName?: string;
  children: React.ReactNode;
}

const sizeClass: Record<ButtonSize, string> = {
  md: styles.buttonMd,
  sm: styles.buttonSm,
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  contentClassName = "",
  children,
  style,
  ...props
}: ButtonProps) {
  const sizeStyles = sizeClass[size];

  if (variant === "primary") {
    return (
      <button
        type="button"
        className={[
          styles.button,
          styles.buttonPrimary,
          sizeStyles,
          fullWidth ? styles.fullWidth : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <GlassSurface
      preset="pill"
      radius={16}
      fullWidth={fullWidth}
      className={[styles.button, styles.buttonGlass, className]
        .filter(Boolean)
        .join(" ")}
      contentClassName={[sizeStyles, contentClassName].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      {children}
    </GlassSurface>
  );
}
