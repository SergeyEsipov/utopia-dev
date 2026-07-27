import type { Metadata } from "next";
import { SiteDock } from "@/components/layout/SiteDock";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { SiteNav } from "@/components/layout/SiteNav";
import { FooterSection } from "@/components/sections/FooterSection";
import { PrivacyDocument, PrivacyHero } from "@/components/terms";
import { alternatesFor } from "@/lib/site";
import styles from "../terms/terms-page.module.css";

/** No `openGraph` block here on purpose — see the note in `terms/page.tsx`. */
export const metadata: Metadata = {
  title: "Privacy Policy — Utopia",
  description:
    "How Utopia collects, uses, stores and protects the personal information you share with us.",
  alternates: alternatesFor("/privacy"),
};

export default function PrivacyPage() {
  return (
    <>
      <SiteNav />
      <main className={styles.page}>
        <PrivacyHero />
        <PrivacyDocument />
        <FooterSection />
      </main>
      <SiteMenu />
      <SiteDock />
    </>
  );
}
