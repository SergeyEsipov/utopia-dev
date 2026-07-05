import Image from "next/image";
import { Heading, Text } from "@/design-system/components";
import { DestinationsNav } from "@/components/layout/DestinationsNav";
import {
  footerDestinations,
  footerMobileLinks,
  footerDesktopLinks,
} from "@/lib/data";
import { images } from "@/lib/media";
import styles from "./footer-section.module.css";
import { FooterScrollTop } from "./FooterScrollTop";

export function FooterSection() {
  return (
    <footer className={styles.footer}>
      <div className={styles.mobile}>
        <div className={styles.mobileBlock}>
          <Text variant="base" className={styles.mobileLabel}>
            Destinations
          </Text>
          <DestinationsNav idPrefix="footer" defaultOpen={null} />
        </div>

        <div className={styles.mobilePages}>
          {footerMobileLinks.experiences.map((page) => (
            <Text key={page} variant="base" as="a" href="#" className={styles.mobilePageLink}>
              {page}
            </Text>
          ))}
        </div>

        <div className={styles.mobilePages}>
          {footerMobileLinks.company.map((page) => (
            <Text key={page} variant="base" as="a" href="#" className={styles.mobilePageLink}>
              {page}
            </Text>
          ))}
        </div>

        <div className={styles.mobileLegal}>
          <Text variant="caption" muted>
            Copyright © 2026 Utopia. All Rights Reserved
          </Text>
          <Text variant="caption" muted as="a" href="#">
            Terms and Conditions
          </Text>
          <Text variant="caption" muted as="a" href="#">
            Privacy Policy
          </Text>
        </div>
      </div>

      <div className={styles.desktop}>
        <div className={styles.columns}>
          {(Object.keys(footerDestinations) as (keyof typeof footerDestinations)[]).map(
            (category) => (
              <div key={category} className={styles.column}>
                <Heading variant="section" as="h3" className={styles.columnTitle}>
                  {category}
                </Heading>
                <ul className={styles.columnList}>
                  {footerDestinations[category].map((item) => (
                    <li key={item.label}>
                      <a
                        href="#"
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

          <div className={styles.column}>
            <ul className={styles.columnList}>
              {footerDesktopLinks.experiences.map((link) => (
                <li key={link}>
                  <a href="#" className={styles.columnLink}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <ul className={styles.columnList}>
              {footerDesktopLinks.company.map((link) => (
                <li key={link}>
                  <a href="#" className={styles.columnLink}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <FooterScrollTop />

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
          <Text variant="caption" muted as="a" href="#" className={styles.legalCenter}>
            Terms and conditions
          </Text>
          <Text variant="caption" muted as="a" href="#" className={styles.legalRight}>
            Privacy policy
          </Text>
        </div>
      </div>
    </footer>
  );
}
