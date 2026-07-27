import Image from "next/image";
import { icons } from "@/design-system/assets";
import styles from "./menu-toggle-icon.module.css";

/**
 * The burger/close glyph for every menu toggle on the site.
 *
 * Both icons are always in the DOM and CSS cross-fades between them off the
 * *button's* `aria-expanded` — the prototypes' mechanism (desktop_v9 243-264,
 * desktop_v10 294-315, identical rules). Rendering a single icon and swapping
 * its `name`, which is what all three toggles used to do, cannot animate at
 * all: React replaces the `<img>` outright, so there is no from-state for a
 * transition to run from and the glyph simply pops.
 *
 * `aria-expanded` stays the single source of truth — this component reads no
 * state and takes no `isOpen` prop, so the visual and the accessible state can
 * never disagree. The caller keeps owning `aria-label` (Open menu / Close
 * menu) and `aria-expanded`.
 *
 * Uses `next/image` rather than the design-system `Icon`, whose shared `.icon`
 * class would compete with the absolute positioning from another CSS module.
 */
export function MenuToggleIcon({ size = 16 }: { size?: number }) {
  return (
    <span
      className={styles.stack}
      style={
        size === 16
          ? undefined
          : ({ "--toggle-icon-size": `${size}px` } as React.CSSProperties)
      }
      aria-hidden
    >
      <Image
        src={icons.menu}
        alt=""
        width={size}
        height={size}
        className={`${styles.icon} ${styles.menu}`}
      />
      <Image
        src={icons.close}
        alt=""
        width={size}
        height={size}
        className={`${styles.icon} ${styles.close}`}
      />
    </span>
  );
}
