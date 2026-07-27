/* eslint-disable @next/next/no-img-element -- brand/arrow/social icons are SVGs;
   the Next image optimizer rejects SVG (dangerouslyAllowSVG is off), so they
   are served as plain <img>. */
import Link from "next/link";
import { Text } from "@/design-system/components";
import { DestinationsNav } from "@/components/layout/DestinationsNav";
import { footerDestinations, menuLinks, footerSocials } from "@/lib/data";
import {
  HOME_HREF,
  PRIVACY_HREF,
  TERMS_HREF,
  getCompanyHref,
  isCompanyLinkInert,
} from "@/lib/routes";
import styles from "./footer-section.module.css";
import { FooterLeaves } from "./FooterLeaves";
import { RevealGroup } from "../RevealGroup";

/** Hover-reveal arrow link (prototype desktop_v9 .footer__link-with-arrow).
    `href` is required: a company link with no page yet renders as the inert
    span instead (see `isCompanyLinkInert`), so this never has to stand in for
    a destination-less anchor. */
function ArrowLink({
  href,
  children,
}: {
  href: string;
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

            {/* A link whose page does not exist yet is inert, not just
                href-less: About was already marked `disabled` in the data,
                Contact was not, so it rendered as a live-looking anchor that
                went nowhere. `isCompanyLinkInert` covers both from the routing
                table. The inert element is a <span>, which keeps it readable
                and in the DOM while taking it out of the tab order — the
                `pointer-events: none` on `.mobilePageLinkDisabled` alone would
                leave a focusable-but-unclickable anchor. */}
            <nav className={styles.mobilePages} aria-label="Site">
              {menuLinks.map((link) => {
                const href = getCompanyHref(link.label);
                return isCompanyLinkInert(link.label) || !href ? (
                  <Text
                    key={link.label}
                    variant="base"
                    as="span"
                    aria-disabled="true"
                    className={`${styles.mobilePageLink} ${styles.mobilePageLinkDisabled}`}
                  >
                    {link.label}
                  </Text>
                ) : (
                  <Text
                    key={link.label}
                    variant="base"
                    as="a"
                    href={href}
                    className={styles.mobilePageLink}
                  >
                    {link.label}
                  </Text>
                );
              })}
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
            {/* The brand signature goes home, matching the dock's home button.
                `aria-label` is on the link rather than left to the images: of
                the three only the wordmark has a non-empty alt, and it is
                `display: none` on tablet — so the accessible name would have
                been "Utopia" on desktop and nothing at all on tablet.
                Deliberately not added to the mobile footer, which has no brand
                mark: Figma `154:6340` opens straight on the link columns. */}
            <Link
              href={HOME_HREF}
              className={styles.brand}
              aria-label="Utopia home"
              data-reveal
            >
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
            </Link>

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
                {menuLinks.map((link) => {
                  const href = getCompanyHref(link.label);
                  return isCompanyLinkInert(link.label) || !href ? (
                    <span
                      key={link.label}
                      className={styles.linkDisabled}
                      aria-disabled="true"
                    >
                      {link.label}
                    </span>
                  ) : (
                    <ArrowLink key={link.label} href={href}>
                      {link.label}
                    </ArrowLink>
                  );
                })}
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
