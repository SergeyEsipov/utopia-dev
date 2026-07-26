"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { images } from "@/lib/media";
import {
  OTHER_DEPARTMENT,
  type JobDepartment,
  type JobPostingSummary,
} from "@/lib/revolut-people";
import styles from "./careers.module.css";

const ROLES_PAGE_SIZE = 5;

type LocationOption = { name: string; type: "office" | "remote"; count: number };

type CareerJobsListProps = {
  postings: JobPostingSummary[];
  departments: JobDepartment[];
  unavailable?: boolean;
};

type LocationFilterProps = {
  options: LocationOption[];
  total: number;
  value: string | null;
  onChange: (value: string | null) => void;
};

function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function departmentKey(posting: JobPostingSummary): string {
  return posting.department ?? OTHER_DEPARTMENT;
}

function getLocationOptions(postings: JobPostingSummary[]): LocationOption[] {
  const options = new Map<string, LocationOption>();
  for (const posting of postings) {
    const seen = new Set<string>();
    for (const location of posting.locations) {
      if (seen.has(location.name)) continue;
      seen.add(location.name);
      const existing = options.get(location.name);
      if (existing) existing.count += 1;
      else options.set(location.name, { name: location.name, type: location.type, count: 1 });
    }
  }
  return [...options.values()].sort(
    (a, b) =>
      (a.type === b.type ? 0 : a.type === "office" ? -1 : 1) ||
      a.name.localeCompare(b.name),
  );
}

function locationLine(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names[0]} +${names.length - 1}`;
}

function LocationFilter({ options, total, value, onChange }: LocationFilterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const select = (next: string | null) => {
    onChange(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const offices = options.filter((option) => option.type === "office");
  const remote = options.filter((option) => option.type === "remote");

  const renderOption = (option: LocationOption) => (
    <li key={option.name}>
      <button
        type="button"
        className={cx(
          styles.filterOption,
          value === option.name && styles.filterOptionActive,
        )}
        aria-pressed={value === option.name}
        onClick={() => select(option.name)}
      >
        <span>{option.name}</span>
        <span className={styles.filterOptionCount}>{option.count}</span>
      </button>
    </li>
  );

  return (
    <div
      className={cx(styles.filterField, styles.filterFieldLocation)}
      ref={rootRef}
    >
      <button
        type="button"
        ref={triggerRef}
        className={cx(styles.filterControl, styles.filterLocation)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={value ? undefined : styles.filterPlaceholder}>
          {value ?? "Select location"}
        </span>
        <Image
          src={images.careerChevronDown}
          alt=""
          width={8}
          height={4}
          className={cx(styles.filterIcon, open && styles.filterIconOpen)}
        />
      </button>
      {open ? (
        <div className={styles.filterPopover} id={listId}>
          <ul className={styles.filterOptionList}>
            <li>
              <button
                type="button"
                className={cx(
                  styles.filterOption,
                  value === null && styles.filterOptionActive,
                )}
                aria-pressed={value === null}
                onClick={() => select(null)}
              >
                <span>All locations</span>
                <span className={styles.filterOptionCount}>{total}</span>
              </button>
            </li>
            {offices.length > 0 ? (
              <li className={styles.filterGroupLabel} aria-hidden>
                Offices
              </li>
            ) : null}
            {offices.map(renderOption)}
            {remote.length > 0 ? (
              <li className={styles.filterGroupLabel} aria-hidden>
                Remote
              </li>
            ) : null}
            {remote.map(renderOption)}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function CareerJobsList({
  postings,
  departments,
  unavailable = false,
}: CareerJobsListProps) {
  const [location, setLocation] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(ROLES_PAGE_SIZE);

  const locationOptions = useMemo(() => getLocationOptions(postings), [postings]);
  const hasFilters = location !== null || department !== null || query.trim() !== "";

  const ordered = useMemo(() => {
    const needle = normalize(query);
    const filtered = postings.filter((posting) => {
      if (location !== null && !posting.locations.some((l) => l.name === location)) {
        return false;
      }
      if (department !== null && departmentKey(posting) !== department) return false;
      if (needle === "") return true;
      return (
        normalize(posting.title).includes(needle) ||
        normalize(posting.department ?? "").includes(needle)
      );
    });
    if (hasFilters) return filtered;
    return [...filtered].sort(
      (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
    );
  }, [postings, location, department, query, hasFilters]);

  const shown = ordered.slice(0, visible);

  const selectLocation = useCallback((next: string | null) => {
    setLocation(next);
    setVisible(ROLES_PAGE_SIZE);
  }, []);

  const selectDepartment = (next: string | null) => {
    setDepartment(next);
    setVisible(ROLES_PAGE_SIZE);
  };

  const clearFilters = () => {
    setLocation(null);
    setDepartment(null);
    setQuery("");
    setVisible(ROLES_PAGE_SIZE);
  };

  return (
    <div className={styles.jobsInner}>
      <div className={styles.filters}>
        <LocationFilter
          options={locationOptions}
          total={postings.length}
          value={location}
          onChange={selectLocation}
        />
        <div className={cx(styles.filterField, styles.filterFieldSearch)}>
          <input
            type="search"
            className={cx(styles.filterControl, styles.filterSearch, styles.filterInput)}
            placeholder={`Search from ${postings.length} open positions`}
            aria-label="Search open positions"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(ROLES_PAGE_SIZE);
            }}
          />
          <Image
            src={images.careerSearchIcon}
            alt=""
            width={12}
            height={12}
            className={styles.filterFieldIcon}
          />
        </div>
      </div>

      <div className={styles.jobsLayout}>
        <aside className={styles.departments} aria-label="Departments">
          <h2 className={styles.departmentsTitle}>Select department</h2>
          <ul className={styles.departmentsList}>
            <li className={styles.departmentItem}>
              <button
                type="button"
                className={cx(
                  styles.departmentButton,
                  department === null && styles.departmentButtonActive,
                )}
                aria-pressed={department === null}
                onClick={() => selectDepartment(null)}
              >
                All
                <span className={styles.departmentCount}> · {postings.length}</span>
              </button>
            </li>
            {departments.map((dept) => (
              <li key={dept.name} className={styles.departmentItem}>
                <button
                  type="button"
                  className={cx(
                    styles.departmentButton,
                    department === dept.name && styles.departmentButtonActive,
                  )}
                  aria-pressed={department === dept.name}
                  onClick={() => selectDepartment(dept.name)}
                >
                  {dept.name}
                  <span className={styles.departmentCount}> · {dept.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className={styles.roles}>
          <h2 id="career-jobs-title" className={styles.rolesTitle} aria-live="polite">
            {hasFilters
              ? `${ordered.length} role${ordered.length === 1 ? "" : "s"}`
              : "Featured roles"}
          </h2>

          {ordered.length === 0 ? (
            <div className={styles.rolesEmpty}>
              <p className={styles.bodyMd}>
                {unavailable
                  ? "Open positions are temporarily unavailable."
                  : hasFilters
                    ? "No roles match these filters."
                    : "There are no open positions right now."}
              </p>
              {hasFilters ? (
                <button
                  type="button"
                  className={styles.linkUnderline}
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : (
            <ul className={styles.rolesList}>
              {shown.map((posting) => {
                const office = locationLine(posting.offices);
                const remote = locationLine(posting.remote);
                return (
                  <li key={posting.id}>
                    <Link href={`/careers/${posting.slug}`} className={styles.roleCard}>
                      <div className={styles.roleHeader}>
                        <h3 className={styles.roleTitle}>{posting.title}</h3>
                        <span className={styles.rolePill}>
                          {posting.department ?? "Utopia"}
                        </span>
                      </div>
                      {office || remote ? (
                        <div className={styles.roleMeta}>
                          <div className={styles.roleIcons} aria-hidden>
                            {office ? (
                              <Image
                                src={images.careerOfficeIcon}
                                alt=""
                                width={15}
                                height={15}
                              />
                            ) : null}
                            {remote ? (
                              <Image
                                src={images.careerRemoteIcon}
                                alt=""
                                width={15}
                                height={15}
                              />
                            ) : null}
                          </div>
                          <div className={styles.roleDetails}>
                            {office ? (
                              <p title={posting.offices.join(", ")}>
                                <span className={styles.roleLabel}>Office · </span>
                                {office}
                              </p>
                            ) : null}
                            {remote ? (
                              <p title={posting.remote.join(", ")}>
                                <span className={styles.roleLabel}>Remote · </span>
                                {remote}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {visible < ordered.length ? (
            <button
              type="button"
              className={styles.showMore}
              onClick={() => setVisible((current) => current + ROLES_PAGE_SIZE)}
            >
              Show more
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
