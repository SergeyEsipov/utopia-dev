import Image from "next/image";
import { Heading, Text } from "@/design-system/components";
import { DestinationsNav } from "@/components/layout/DestinationsNav";
import {
  footerDestinations,
  menuLinks,
  footerDesktopLinks,
} from "@/lib/data";
import { images } from "@/lib/media";
import { NOT_FOUND_HREF, TERMS_HREF, getCompanyHref } from "@/lib/routes";
import styles from "./footer-section.module.css";
import { FooterScrollTop } from "./FooterScrollTop";
import { FooterLeaves } from "./FooterLeaves";

export function FooterSection() {
  return (
    <footer className={styles.footer}>
      <div className={styles.mobile}>
        <FooterLeaves />
        <div className={styles.mobileInner}>
          <div className={styles.mobileGroup}>
            <div className={styles.mobileBlock}>
              <Text variant="base" className={styles.mobileLabel}>
                Destinations
              </Text>
              <DestinationsNav idPrefix="footer" defaultOpen={null} />
            </div>

            <nav className={styles.mobilePages} aria-label="Site">
              {menuLinks.map((link) =>
                "disabled" in link && link.disabled ? (
                  <Text
                    key={link.label}
                    variant="base"
                    as="span"
                    className={`${styles.mobilePageLink} ${styles.mobilePageLinkDisabled}`}
                  >
                    {link.label}
                  </Text>
                ) : (
                  <Text
                    key={link.label}
                    variant="base"
                    as="a"
                    href={getCompanyHref(link.label)}
                    className={styles.mobilePageLink}
                  >
                    {link.label}
                  </Text>
                ),
              )}
            </nav>
          </div>

          <div className={styles.mobileLegal}>
            <Text variant="caption" muted>
              Copyright © 2026 Utopia. All Rights Reserved
            </Text>
            <Text variant="caption" muted as="a" href={TERMS_HREF}>
              Terms and Conditions
            </Text>
            <Text variant="caption" muted as="a" href={NOT_FOUND_HREF}>
              Privacy Policy
            </Text>
          </div>
        </div>
      </div>

      <div className={styles.desktop}>
        <div className={styles.columns}>
          {(Object.keys(footerDestinations) as (keyof typeof footerDestinations)[]).map(
            (category) => (
              <div key={category} className={`${styles.column} ${styles.columnDest}`}>
                <Heading variant="section" as="h3" className={styles.columnTitle}>
                  {category}
                </Heading>
                <ul className={styles.columnList}>
                  {footerDestinations[category].map((item) => (
                    <li key={item.label}>
                      <a
                        href={NOT_FOUND_HREF}
                        className={[
                          styles.columnLink,
                          "active" in item && item.active
                            ? styles.columnLinkActive
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}

          <div className={`${styles.column} ${styles.columnLinks}`}>
            <ul className={styles.columnList}>
              {footerDesktopLinks.experiences.map((link) => (
                <li key={link}>
                  <a href={NOT_FOUND_HREF} className={styles.columnLink}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.column} ${styles.columnLinks}`}>
            <ul className={styles.columnList}>
              {footerDesktopLinks.company.map((link) => (
                <li key={link}>
                  <a href={getCompanyHref(link)} className={styles.columnLink}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.column} ${styles.columnAction}`}>
            <FooterScrollTop />
          </div>
        </div>

        <div className={styles.wordmarkWrap}>
          <Image
            src={images.footerWordmark}
            alt=""
            width={1200}
            height={189}
            className={styles.wordmarkImage}
          />
        </div>

        <div className={styles.legal}>
          <Text variant="caption" muted>
            Copyright © 2026 Utopia. All Rights Reserved
          </Text>
          <Text variant="caption" muted as="a" href={TERMS_HREF} className={styles.legalCenter}>
            Terms and conditions
          </Text>
          <Text variant="caption" muted as="a" href={NOT_FOUND_HREF} className={styles.legalRight}>
            Privacy policy
          </Text>
        </div>
      </div>
    </footer>
  );
}
