/**
 * Privacy Policy copy — Figma 24.07 `154:2584` (desktop 1440×3365), the group
 * sitting under the `154:1971` "Privacy policy" label.
 *
 * Structurally simpler than the Terms document: no group tier, just an
 * un-headed intro paragraph followed by flat 28px sections. Unlike Terms —
 * which is still a partly-adapted Revolut template — this copy is genuinely
 * Utopia's.
 */

export type PrivacySection = {
  id: string;
  heading: string;
  paragraphs: string[];
};

export const privacyHero = {
  title: "Privacy Policy",
  subtitle: "Last updated: July 2026",
} as const;

/** `154:2595` — sits above the first heading, with no heading of its own. */
export const privacyIntro =
  "Utopia respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, store and protect your information when you visit our website, submit an enquiry, make a reservation or otherwise interact with Utopia.";

export const privacySections: PrivacySection[] = [
  {
    id: "information-we-collect",
    heading: "Information We Collect",
    paragraphs: [
      "We may collect personal information that you provide directly to us, including your name, email address, telephone number, country of residence, travel dates, accommodation preferences, guest details and any information included in your enquiries or communications with us.",
      "When you use our website, certain technical information may be collected automatically, such as your IP address, browser and device information, approximate location, pages visited, referral source and interactions with the website.",
      "Where necessary to arrange a stay or requested service, we may also collect additional information relevant to your booking, such as dietary requirements, accessibility requirements, arrival details or other preferences.",
    ],
  },
  {
    id: "how-we-use-your-information",
    heading: "How We Use Your Information",
    paragraphs: [
      "We use personal information to respond to enquiries, arrange and manage reservations, personalise your experience, provide requested services, communicate important information regarding your stay, improve our website and services, maintain security, prevent fraud and comply with applicable legal obligations.",
      "Where permitted by law and with your consent where required, we may also use your contact information to share news, property updates, private offers and other communications from Utopia. You may opt out of marketing communications at any time.",
    ],
  },
  {
    id: "sharing-your-information",
    heading: "Sharing Your Information",
    paragraphs: [
      "We may share personal information with trusted third parties where reasonably necessary to provide our services. These may include villa owners and operators, property management teams, payment providers, concierge partners, transportation providers, technology providers and professional advisers.",
      "We do not sell or rent your personal information.",
      "Some of our properties and service providers operate internationally. As a result, your information may be processed or stored outside your country of residence. Where required, we take appropriate measures to protect personal information transferred internationally.",
    ],
  },
  {
    id: "cookies",
    heading: "Cookies",
    paragraphs: [
      "Our website may use cookies and similar technologies to operate correctly, remember preferences, understand how visitors use the website and improve its performance.",
      "Depending on your location, you may be able to manage non-essential cookies through our cookie preferences interface or through your browser settings.",
    ],
  },
  {
    id: "data-retention-and-security",
    heading: "Data Retention & Security",
    paragraphs: [
      "We retain personal information only for as long as reasonably necessary for the purposes described in this Policy, including fulfilling contractual, accounting and legal requirements.",
      "We use reasonable technical and organisational safeguards designed to protect personal information against unauthorised access, loss, misuse, alteration or disclosure. No online system, however, can guarantee absolute security.",
    ],
  },
  {
    id: "your-rights",
    heading: "Your Rights",
    paragraphs: [
      "Depending on the laws applicable to you, you may have the right to request access to, correction of, deletion of or restriction on the processing of your personal information. You may also have rights relating to data portability, objection to certain processing and withdrawal of consent.",
      "To exercise these rights, please contact Utopia using the contact details provided on our website.",
    ],
  },
  {
    id: "changes-to-this-policy",
    heading: "Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy periodically to reflect changes to our services, practices or applicable laws. The latest version will always be published on this website.",
    ],
  },
  {
    id: "contact",
    heading: "Contact",
    paragraphs: [
      "For questions regarding these Terms, our Privacy Policy or your personal information, please contact Utopia through the contact information provided on our website.",
    ],
  },
];
