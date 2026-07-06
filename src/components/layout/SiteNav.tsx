import Image from "next/image";
import { navDestinations, navLinks } from "@/lib/data";
import { images } from "@/lib/media";
import { getCompanyHref, NOT_FOUND_HREF } from "@/lib/routes";
import styles from "./site-nav.module.css";

type SiteNavProps = {
  activeLink?: (typeof navLinks)[number];
};

export function SiteNav({ activeLink }: SiteNavProps) {
  return (
    <header className={styles.nav}>
      <div className={styles.left}>
        <span className={styles.destLabel}>Destinations</span>
        <span className={styles.separator}>|</span>
        <nav className={styles.destLinks} aria-label="Destination categories">
          {navDestinations.map((dest) => (
            <a key={dest} href={NOT_FOUND_HREF} className={styles.destLink}>
              {dest}
            </a>
          ))}
        </nav>
      </div>

      <a href="/" className={styles.logo} aria-label="Utopia home">
        <Image
          src={images.navWordmark}
          alt="Utopia"
          width={87}
          height={14}
          priority
        />
      </a>

      <nav className={styles.right} aria-label="Site links">
        {navLinks.map((link) => (
          <a
            key={link}
            href={getCompanyHref(link)}
            className={[
              styles.navLink,
              activeLink === link ? styles.navLinkActive : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={activeLink === link ? "page" : undefined}
          >
            {link}
          </a>
        ))}
      </nav>
    </header>
  );
}
