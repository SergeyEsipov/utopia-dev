import { getJobPostings } from "@/lib/revolut-people";
import { CareerJobsList } from "./CareerJobsList";
import styles from "./careers.module.css";

export async function CareerJobs() {
  const postings = await getJobPostings();
  const items = postings ?? [];
  return (
    <section className={styles.sectionWide} aria-labelledby="career-jobs-title">
      <div className={`${styles.sectionInner} ${styles.jobs}`}>
        {/* Departments are derived inside the list: they have to re-scope as
            the location filter changes, so a server-built list would drift. */}
        <CareerJobsList postings={items} unavailable={postings === null} />
      </div>
    </section>
  );
}
