import { buildDepartments, getJobPostings } from "@/lib/revolut-people";
import { CareerJobsList } from "./CareerJobsList";
import styles from "./careers.module.css";

export async function CareerJobs() {
  const postings = await getJobPostings();
  const items = postings ?? [];
  return (
    <section className={styles.sectionWide} aria-labelledby="career-jobs-title">
      <div className={`${styles.sectionInner} ${styles.jobs}`}>
        <CareerJobsList
          postings={items}
          departments={buildDepartments(items)}
          unavailable={postings === null}
        />
      </div>
    </section>
  );
}
