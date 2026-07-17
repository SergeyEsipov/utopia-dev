import type { Metadata } from "next";
import { SiteDock } from "@/components/layout/SiteDock";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { SiteNav } from "@/components/layout/SiteNav";
import { FooterSection } from "@/components/sections/FooterSection";
import { TermsDocument, TermsHero } from "@/components/terms";
import styles from "./terms-page.module.css";

export const metadata: Metadata = {
  title: "Website Terms — Utopia",
  description:
    "The terms and conditions that apply when you use the Utopia website.",
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
