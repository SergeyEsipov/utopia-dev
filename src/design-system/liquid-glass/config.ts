import type { CSSProperties } from "react";

/** Visual tuning aligned with Figma / legacy `--glass-*` tokens */
export type GlassPresetValues = {
  background: string;
  blur: string;
  saturate: number;
  shadow: string;
  border?: string;
  sheen?: string;
};

export const UTOPIA_GLASS_BASE = {
  blur: "16px",
  saturate: 1.65,
  shadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
  border: "1px solid rgba(255, 255, 255, 0.35)",
  sheen:
    "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 38%, rgba(255,255,255,0) 100%)",
} as const;

export const glassPresets = {
  /** Dock / footer chrome — Figma `173:1888` */
  dock: {
    background: "rgba(229, 218, 203, 0.8)",
    blur: "0px",
    saturate: 1,
    shadow: "none",
  },
  /** Nav pills, opening CTA — rgba(249, 245, 234, 0.6) */
  pill: {
    ...UTOPIA_GLASS_BASE,
    background: "rgba(249, 245, 234, 0.6)",
  },
  /** Desktop opening CTA — stronger cream glass */
  pillStrong: {
    ...UTOPIA_GLASS_BASE,
    background: "rgba(249, 245, 234, 0.8)",
  },
} as const satisfies Record<string, GlassPresetValues>;

export type GlassPresetName = keyof typeof glassPresets;

export function resolveGlassPreset(
  preset: GlassPresetName | Partial<GlassPresetValues> = "pill",
): GlassPresetValues {
  if (typeof preset === "string") {
    return glassPresets[preset];
  }
  return { ...glassPresets.pill, ...preset };
}

export function glassBackdropStyle(preset: GlassPresetValues): CSSProperties {
  if (preset.blur === "0px" && preset.saturate === 1) {
    return {};
  }
  return {
    backdropFilter: `blur(${preset.blur}) saturate(${preset.saturate})`,
    WebkitBackdropFilter: `blur(${preset.blur}) saturate(${preset.saturate})`,
  };
}
