import type { Metadata } from "next";
import { SiteDock } from "@/components/layout/SiteDock";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { SiteNav } from "@/components/layout/SiteNav";
import { FooterSection } from "@/components/sections/FooterSection";
import { PrivacyDocument, PrivacyHero } from "@/components/terms";
import styles from "../terms/terms-page.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — Utopia",
  description:
    "How Utopia collects, uses, stores and protects the personal information you share with us.",
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
