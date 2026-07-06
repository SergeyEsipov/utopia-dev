export type HapticKind = "light" | "selection" | "medium" | "navigate" | "success";

/** Short, pleasant patterns — tuned for mobile (Android Vibration API) */
const PATTERNS: Record<HapticKind, number | number[]> = {
  light: 6,
  selection: 8,
  medium: 10,
  navigate: 12,
  success: [8, 55, 12],
};

let lastAt = 0;
const MIN_INTERVAL_MS = 40;

function canUseHaptics(): boolean {
  if (typeof window === "undefined") return false;
  if (!("vibrate" in navigator)) return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function triggerHaptic(kind: HapticKind = "light"): void {
  if (!canUseHaptics()) return;

  const now = Date.now();
  if (now - lastAt < MIN_INTERVAL_MS) return;
  lastAt = now;

  try {
    navigator.vibrate(PATTERNS[kind]);
  } catch {
    /* ignore unsupported / blocked vibrate */
  }
}

export function withHaptic<T extends (...args: never[]) => void>(
  fn: T,
  kind: HapticKind = "light",
): T {
  return ((...args: never[]) => {
    triggerHaptic(kind);
    fn(...args);
  }) as T;
}
