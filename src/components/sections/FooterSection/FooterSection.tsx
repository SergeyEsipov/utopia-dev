/* eslint-disable @next/next/no-img-element -- brand/arrow/social icons are SVGs;
   the Next image optimizer rejects SVG (dangerouslyAllowSVG is off), so they
   are served as plain <img>. */
import { Text } from "@/design-system/components";
import { DestinationsNav } from "@/components/layout/DestinationsNav";
import { footerDestinations, menuLinks, footerSocials } from "@/lib/data";
import { PRIVACY_HREF, TERMS_HREF, getCompanyHref } from "@/lib/routes";
import styles from "./footer-section.module.css";
import { FooterLeaves } from "./FooterLeaves";
import { RevealGroup } from "../RevealGroup";

/** Hover-reveal arrow link (prototype desktop_v9 .footer__link-with-arrow). */
/** `href` is optional: a link whose page does not exist yet renders with the
    same styling but no destination (see routes.ts). */
function ArrowLink({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className={styles.linkArrow}>
      {children}
      <span className={styles.linkArrowIcon}>
        <img src="/assets/nav-arrow-black.svg" alt="" />
      </span>
    </a>
  );
}

const DEST_COLUMN_CLASS: Record<keyof typeof footerDestinations, string> = {
  Tropical: styles.colTropical,
  Urban: styles.colUrban,
  Alpine: styles.colAlpine,
};

export function FooterSection() {
  return (
    <footer className={styles.footer}>
      <div className={styles.mobile}>
        <FooterLeaves
          className={styles.mobileLeaves}
          hevcSrc="/assets/footer-leaves-mobile.hevc.mp4"
          mp4Src="/assets/footer-leaves-mobile.mp4"
        />
        <div className={styles.mobileInner}>
          <div className={styles.mobileGroup}>
            <div className={styles.mobileBlock}>
              {/* Figma 24.07 `154:6360`: the categories start the footer, with
                  no "Destinations" label above them. */}
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

          {/* Figma 24.07 `154:6383`: socials first, then Terms and Privacy
              side by side, then the copyright — 24px between the social row
              and the info block, 12px inside it, 16px between the two links. */}
          <div className={styles.mobileBottom}>
            <div className={styles.mobileSocials}>
              {footerSocials.map((social) => (
                <span key={social.label} className={styles.mobileSocialIcon}>
                  <img src={social.icon} alt="" />
                  <span className={styles.srOnly}>{social.label}</span>
                </span>
              ))}
            </div>

            <div className={styles.mobileLegal}>
              <div className={styles.mobileLegalRow}>
                <Text variant="caption" muted as="a" href={TERMS_HREF}>
                  Terms and Conditions
                </Text>
                <Text variant="caption" muted as="a" href={PRIVACY_HREF}>
                  Privacy Policy
                </Text>
              </div>
              <Text variant="caption" muted>
                © 2026 Utopia. All Rights Reserved
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop / tablet footer — prototype desktop_v9. */}
      <RevealGroup className={styles.desktop}>
        <FooterLeaves
          className={styles.desktopLeaves}
          hevcSrc="/assets/footer-leaves.hevc.mp4"
          mp4Src="/assets/footer-leaves.mp4"
        />

        <div className={styles.top}>
          <div className={styles.menu}>
            <div className={styles.brand} data-reveal>
              <img
                className={`${styles.brandMark} ${styles.brandMarkDesktop}`}
                src="/assets/footer-logo-mark.svg"
                alt=""
              />
              <img
                className={`${styles.brandMark} ${styles.brandMarkTablet}`}
                src="/assets/logo-mark.svg"
                alt=""
              />
              <img
                className={styles.brandWord}
                src="/assets/footer-wordmark2.svg"
                alt="Utopia"
              />
            </div>

            {(Object.keys(footerDestinations) as (keyof typeof footerDestinations)[]).map(
              (category) => (
                <div key={category} className={`${styles.col} ${DEST_COLUMN_CLASS[category]}`} data-reveal>
                  <p className={styles.colHeading}>{category}</p>
                  <div className={styles.colLinks}>
                    {footerDestinations[category].map((item) => (
                      <span
                        key={item.label}
                        className={styles.linkDisabled}
                        aria-disabled="true"
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              ),
            )}

            <div className={`${styles.col} ${styles.colExperiences}`} data-reveal>
              <p className={styles.colHeading}>Experiences</p>
              <div className={styles.colLinks}>
                <span className={styles.linkDisabled} aria-disabled="true">
                  Coming soon
                </span>
              </div>
            </div>

            <div className={`${styles.linksCol} ${styles.linksColContact}`} data-reveal>
              <div className={`${styles.colLinks} ${styles.colLinksDark}`}>
                {menuLinks.map((link) =>
                  "disabled" in link && link.disabled ? (
                    <span
                      key={link.label}
                      className={styles.linkDisabled}
                      aria-disabled="true"
                    >
                      {link.label}
                    </span>
                  ) : (
                    <ArrowLink key={link.label} href={getCompanyHref(link.label)}>
                      {link.label}
                    </ArrowLink>
                  ),
                )}
              </div>
            </div>

            <div className={styles.legalCol} data-reveal>
              <div className={`${styles.colLinks} ${styles.colLinksDark}`}>
                <ArrowLink href={TERMS_HREF}>Terms and conditions</ArrowLink>
                <ArrowLink href={PRIVACY_HREF}>Privacy policy</ArrowLink>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottom} data-reveal>
          <p className={styles.copy}>© 2026 Utopia. All Rights Reserved</p>
          <div className={styles.bottomLegal}>
            <a href={TERMS_HREF} className={`${styles.bottomLink} ${styles.bottomCellTerms}`}>
              Terms and conditions
            </a>
            <a
              href={PRIVACY_HREF}
              className={`${styles.bottomLink} ${styles.bottomCellPrivacy}`}
            >
              Privacy policy
            </a>
          </div>
          <div className={styles.social}>
            {footerSocials.map((s) => (
              <span
                key={s.label}
                className={`${styles.socialIcon} ${styles.linkDisabled}`}
                aria-label={s.label}
                role="img"
              >
                <img src={s.icon} alt="" />
              </span>
            ))}
          </div>
        </div>
      </RevealGroup>
    </footer>
  );
}
