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
import { getJobPostings } from "@/lib/revolut-people";
import { alternatesFor } from "@/lib/site";
import styles from "./careers-page.module.css";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Careers — Utopia",
  description:
    "Join Utopia — an ultra-luxury hospitality and lifestyle brand with open positions worldwide.",
  alternates: alternatesFor("/careers"),
};

export default async function CareersPage() {
  const postings = await getJobPostings();

  return (
    <>
      <SiteNav />
      <main className={styles.page}>
        <CareerHero openPositions={postings?.length ?? null} />
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
