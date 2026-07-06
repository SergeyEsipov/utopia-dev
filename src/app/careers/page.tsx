import type { Metadata } from "next";
import { SiteDock } from "@/components/layout/SiteDock";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { SiteNav } from "@/components/layout/SiteNav";
import { FooterSection } from "@/components/sections/FooterSection";
import {
  CareerCta,
  CareerHero,
  CareerJobs,
  CareerTeams,
  CareerValues,
  CareerWorkCarousel,
} from "@/components/careers";
import styles from "./careers-page.module.css";

export const metadata: Metadata = {
  title: "Careers — Utopia",
  description:
    "Join Utopia — an ultra-luxury hospitality and lifestyle brand with 80+ open positions worldwide.",
};

export default function CareersPage() {
  return (
    <>
      <SiteNav activeLink="Careers" />
      <main className={styles.page}>
        <CareerHero />
        <CareerJobs />
        <CareerTeams />
        <CareerValues />
        <CareerWorkCarousel />
        <CareerCta />
        <FooterSection />
      </main>
      <SiteMenu />
      <SiteDock />
    </>
  );
}
