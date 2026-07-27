"use client";

import { useRouter } from "next/navigation";
import { GlassSurface } from "@/design-system/liquid-glass";
import { triggerHaptic } from "@/lib/haptics";
import { HOME_HREF } from "@/lib/routes";
import styles from "@/app/not-found.module.css";

/**
 * Figma `154:8716` / `154:6621`: a cream glass pill over the photograph —
 * 252×44 from 640 up, 194×40 on mobile, `rgba(249,245,234,0.8)` behind a
 * blur, which is the `pillStrong` preset. The radius is deliberately left to
 * `GlassSurface`'s own `--utopia-radius-control`, so it stays fully pill in
 * `rounded` and drops to 2px in `sharp`.
 */
export function NotFoundHomeButton() {
  const router = useRouter();

  return (
    <GlassSurface
      preset="pillStrong"
      interactive={false}
      className={styles.homeButton}
      contentClassName={styles.homeButtonContent}
      onClick={() => {
        triggerHaptic("light");
        router.push(HOME_HREF);
      }}
    >
      Return to home
    </GlassSurface>
  );
}
