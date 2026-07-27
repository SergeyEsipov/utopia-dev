import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
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
import {
  getJobPosting,
  getJobPostings,
  jobPostingExcerpt,
} from "@/lib/revolut-people";
import { alternatesFor } from "@/lib/site";
import styles from "../careers-page.module.css";

type JobOpeningPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 900;
export const dynamicParams = true;

export async function generateStaticParams() {
  const postings = await getJobPostings();
  return (postings ?? []).map((posting) => ({ slug: posting.slug }));
}

export async function generateMetadata({
  params,
}: JobOpeningPageProps): Promise<Metadata> {
  const { slug } = await params;
  const posting = await getJobPosting(slug);
  if (!posting) {
    return { title: "Page not found — Utopia" };
  }
  const description = jobPostingExcerpt(posting, 160);
  const location = [...posting.offices, ...posting.remote][0];
  return {
    title: `${posting.title} — Careers at Utopia`,
    description,
    alternates: alternatesFor(`/careers/${posting.slug}`),
    openGraph: {
      type: "article",
      title: `${posting.title}${location ? ` · ${location}` : ""} — Utopia`,
      description,
    },
  };
}

export default async function JobOpeningPage({ params }: JobOpeningPageProps) {
  const { slug } = await params;
  const posting = await getJobPosting(slug);
  if (!posting) {
    notFound();
  }
  if (posting.slug !== slug) {
    permanentRedirect(`/careers/${posting.slug}`);
  }

  return (
    <>
      <SiteNav />
      <main className={styles.page}>
        <JobHero posting={posting} />
        <JobDescription
          sections={posting.sections}
          applyUrl={posting.applyUrl}
        />
        <JobWorkCarousel />
        <JobTeamUp />
        <JobCta applyUrl={posting.applyUrl} />
        <FooterSection />
      </main>
      <SiteMenu />
      <SiteDock />
    </>
  );
}
