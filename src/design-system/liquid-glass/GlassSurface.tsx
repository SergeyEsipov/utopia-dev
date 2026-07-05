"use client";

import {
  forwardRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  type GlassPresetName,
  glassBackdropStyle,
  resolveGlassPreset,
  type GlassPresetValues,
} from "./config";
import styles from "./glass-surface.module.css";

type SharedProps = {
  preset?: GlassPresetName | Partial<GlassPresetValues>;
  /** Minimum height; surface grows with content padding */
  height?: number;
  radius?: number;
  fullWidth?: boolean;
  interactive?: boolean;
  contentClassName?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export type GlassSurfaceProps = SharedProps &
  (
    | ({ as?: "button" } & Omit<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        keyof SharedProps
      >)
    | ({ as: "div" } & Omit<
        React.HTMLAttributes<HTMLDivElement>,
        keyof SharedProps
      >)
  );

export const GlassSurface = forwardRef<
  HTMLButtonElement | HTMLDivElement,
  GlassSurfaceProps
>(function GlassSurface(props, ref) {
  const {
    as = "button",
    preset = "pill",
    height,
    radius = 16,
    fullWidth = false,
    interactive = true,
    className = "",
    contentClassName = "",
    style,
    children,
    ...rest
  } = props;

  const glass = resolveGlassPreset(preset);

  const surfaceClassName = [
    styles.glass,
    fullWidth ? styles.glassBlock : "",
    fullWidth ? styles.fullWidth : "",
    !interactive ? styles.glassStatic : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const surfaceStyle: CSSProperties = {
    minHeight: height,
    borderRadius: radius,
    background: glass.background,
    boxShadow: glass.shadow,
    border: glass.border,
    ...style,
  };

  const contentClasses = [
    styles.content,
    fullWidth ? styles.contentFill : "",
    contentClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <div
        className={styles.backdrop}
        style={glassBackdropStyle(glass)}
        aria-hidden
      />
      {glass.sheen ? (
        <div
          className={styles.sheen}
          style={{ background: glass.sheen }}
          aria-hidden
        />
      ) : null}
      <div className={contentClasses}>{children}</div>
    </>
  );

  if (as === "div") {
    const divProps = rest as React.HTMLAttributes<HTMLDivElement>;
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={surfaceClassName}
        style={surfaceStyle}
        {...divProps}
      >
        {content}
      </div>
    );
  }

  const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      className={surfaceClassName}
      style={surfaceStyle}
      {...buttonProps}
    >
      {content}
    </button>
  );
});
