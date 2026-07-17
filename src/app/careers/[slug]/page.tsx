import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteDock } from "@/components/layout/SiteDock";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { SiteNav } from "@/components/layout/SiteNav";
import { FooterSection } from "@/components/sections/FooterSection";
import {
  JobDescription,
  JobHero,
  JobTeamUp,
} from "@/components/careers";
import { JobCta } from "@/components/careers/JobCta";
import { JobWorkCarousel } from "@/components/careers/JobWorkCarousel";
import { careerFeaturedRoles, jobOpeningContent } from "@/lib/career-data";
import styles from "../careers-page.module.css";

type JobOpeningPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return careerFeaturedRoles.map((role) => ({ slug: role.id }));
}

export async function generateMetadata({
  params,
}: JobOpeningPageProps): Promise<Metadata> {
  const { slug } = await params;
  const role = careerFeaturedRoles.find((item) => item.id === slug);
  if (!role) {
    return { title: "Job Opening — Utopia" };
  }
  return {
    title: `${role.title} — Careers at Utopia`,
    description: jobOpeningContent.intro,
  };
}

export default async function JobOpeningPage({ params }: JobOpeningPageProps) {
  const { slug } = await params;
  const role = careerFeaturedRoles.find((item) => item.id === slug);
  if (!role) {
    notFound();
  }

  return (
    <>
      <SiteNav activeLink="Careers" />
      <main className={styles.page}>
        <JobHero role={role} />
        <JobDescription />
        <JobWorkCarousel />
        <JobTeamUp />
        <JobCta />
        <FooterSection />
      </main>
      <SiteMenu />
      <SiteDock />
    </>
  );
}
