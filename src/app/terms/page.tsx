import type { Metadata } from "next";
import { SiteDock } from "@/components/layout/SiteDock";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { SiteNav } from "@/components/layout/SiteNav";
import { FooterSection } from "@/components/sections/FooterSection";
import { TermsDocument, TermsHero } from "@/components/terms";
import { alternatesFor } from "@/lib/site";
import styles from "./terms-page.module.css";

/**
 * Deliberately sets no `openGraph` block: declaring one replaces the root
 * layout's wholesale, taking the file-convention og:image with it (see
 * layout.tsx). Title and description inherit everything else from there.
 * Copy is a placeholder pending the Figma strings (bug #29).
 */
export const metadata: Metadata = {
  title: "Website Terms — Utopia",
  description:
    "The terms and conditions that apply when you use the Utopia website.",
  alternates: alternatesFor("/terms"),
};

export default function TermsPage() {
  return (
    <>
      <SiteNav />
      <main className={styles.page}>
        <TermsHero />
        <TermsDocument />
        <FooterSection />
      </main>
      <SiteMenu />
      <SiteDock />
    </>
  );
}
