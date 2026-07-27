"use client";

import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/design-system/components";
import { GlassSurface } from "@/design-system/liquid-glass";
import { useMenu } from "@/contexts/MenuContext";
import { triggerHaptic } from "@/lib/haptics";
import { HOME_HREF } from "@/lib/routes";
import { MenuToggleIcon } from "./MenuToggleIcon";
import styles from "./site-dock.module.css";

const BTN = 40;

export function SiteDock() {
  const { isOpen, toggle } = useMenu();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className={styles.dockWrap}>
      <div className={styles.dock}>
        <GlassSurface
          preset="pill"
          height={BTN}
          interactive={false}
          className={styles.iconBtn}
          contentClassName={styles.iconBtnContent}
          aria-label="Home"
          onClick={() => {
            triggerHaptic("light");
            // On any other route this is a real navigation home. On the home
            // page itself `push("/")` would be a no-op with nothing to show
            // for the tap, so it keeps the scroll-to-top it always had.
            if (pathname === HOME_HREF) {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              router.push(HOME_HREF);
            }
          }}
        >
          <Icon name="dockMark" size={16} alt="" className={styles.logoMark} />
        </GlassSurface>

        <GlassSurface
          preset="pill"
          height={BTN}
          fullWidth
          interactive={false}
          className={styles.cta}
          contentClassName={styles.ctaContent}
          // No destination yet — see routes.ts.
          onClick={() => triggerHaptic("light")}
        >
          Request a stay
        </GlassSurface>

        <GlassSurface
          preset="pill"
          height={BTN}
          interactive={false}
          className={styles.iconBtn}
          contentClassName={styles.iconBtnContent}
          aria-expanded={isOpen}
          aria-controls="site-menu"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => {
            triggerHaptic("medium");
            toggle();
          }}
        >
          {/* Same cross-fade as the bar's burger — the dock and the bar are one
              affordance in two shapes (see site-dock.module.css), and this is
              the button bug #2 was filed against, so it is the one that most
              needs to read as a close. The prototypes have no dock to port
              from; it is our own Figma pattern, given the prototype's
              behaviour. */}
          <MenuToggleIcon />
        </GlassSurface>
      </div>
    </div>
  );
}
