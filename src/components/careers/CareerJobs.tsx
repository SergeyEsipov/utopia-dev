import Image from "next/image";
import Link from "next/link";
import {
  careerDepartments,
  careerFeaturedRoles,
} from "@/lib/career-data";
import { images } from "@/lib/media";
import styles from "./careers.module.css";

export function CareerJobs() {
  return (
    <section className={styles.sectionWide} aria-labelledby="career-jobs-title">
      <div className={`${styles.sectionInner} ${styles.jobs}`}>
        <div className={styles.jobsInner}>
          <div className={styles.filters}>
            <button type="button" className={`${styles.filterControl} ${styles.filterLocation}`}>
              <span>Select location</span>
              <Image
                src={images.careerChevronDown}
                alt=""
                width={8}
                height={4}
                className={styles.filterIcon}
              />
            </button>
            <button type="button" className={`${styles.filterControl} ${styles.filterSearch}`}>
              <span className={styles.filterPlaceholder}>
                Search from 80+ open positions
              </span>
              <Image
                src={images.careerSearchIcon}
                alt=""
                width={12}
                height={12}
                className={styles.filterIcon}
              />
            </button>
          </div>

          <div className={styles.jobsLayout}>
            <aside className={styles.departments} aria-label="Departments">
              <h2 className={styles.departmentsTitle}>Select department</h2>
              <ul className={styles.departmentsList}>
                {careerDepartments.map((dept) => (
                  <li key={dept.name} className={styles.departmentItem}>
                    {dept.name}
                    <span className={styles.departmentCount}> · {dept.count}</span>
                  </li>
                ))}
              </ul>
            </aside>

            <div className={styles.roles}>
              <h2 id="career-jobs-title" className={styles.rolesTitle}>
                Featured roles
              </h2>
              <ul className={styles.rolesList}>
                {careerFeaturedRoles.map((role) => (
                  <li key={role.id}>
                    <Link
                      href={`/careers/${role.id}`}
                      className={styles.roleCard}
                    >
                      <div className={styles.roleHeader}>
                        <h3 className={styles.roleTitle}>{role.title}</h3>
                        <span className={styles.rolePill}>{role.department}</span>
                      </div>
                      <div className={styles.roleMeta}>
                        <div className={styles.roleIcons} aria-hidden>
                          <Image
                            src={images.careerOfficeIcon}
                            alt=""
                            width={15}
                            height={15}
                          />
                          <Image
                            src={images.careerRemoteIcon}
                            alt=""
                            width={15}
                            height={15}
                          />
                        </div>
                        <div className={styles.roleDetails}>
                          <p>
                            <span className={styles.roleLabel}>Office · </span>
                            {role.office}
                          </p>
                          <p>
                            <span className={styles.roleLabel}>Remote · </span>
                            {role.remote}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <button type="button" className={styles.showMore}>
                Show more
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
