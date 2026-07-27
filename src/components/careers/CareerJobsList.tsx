"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  departmentOptions as buildDepartmentOptions,
  locationOptions as buildLocationOptions,
  narrowPostings,
  normalizeQuery,
  pairIsReachable,
  withSelected,
  type Facets,
  type SelectOption,
} from "@/lib/career-filters";
import { images } from "@/lib/media";
import { type JobPostingSummary } from "@/lib/revolut-people";
import styles from "./careers.module.css";

const ROLES_PAGE_SIZE = 5;

type CareerJobsListProps = {
  postings: JobPostingSummary[];
  unavailable?: boolean;
};

type SelectFilterProps = {
  /** Placeholder from 640 up, and the accessible name at every width. */
  label: string;
  /** Shorter placeholder mobile uses instead (`154:3569` reads "Department"). */
  shortLabel: string;
  /** Label of the "no filter" row, e.g. "All locations". */
  allLabel: string;
  options: SelectOption[];
  total: number;
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
};

function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

function locationLine(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names[0]} +${names.length - 1}`;
}

/**
 * The outlined pill dropdown used by both filter controls. Figma 24.07 draws
 * two of them side by side below 1024 (`154:3566`, `154:5489`); at 1024 the
 * department one is replaced by the sidebar list and only Location remains
 * (`154:8352`).
 */
function SelectFilter({
  label,
  shortLabel,
  allLabel,
  options,
  total,
  value,
  onChange,
  className,
}: SelectFilterProps) {
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

  const renderOption = (option: SelectOption) => (
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

  const groups: { group: string | undefined; items: SelectOption[] }[] = [];
  for (const option of options) {
    const last = groups[groups.length - 1];
    if (last && last.group === option.group) last.items.push(option);
    else groups.push({ group: option.group, items: [option] });
  }

  return (
    <div className={cx(styles.filterField, className)} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className={styles.filterControl}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
      >
        {/* Figma keeps the dropdown label ink even when nothing is picked —
            only the search placeholder is muted (`154:3569` vs `154:3564`). */}
        <span>
          {value ?? (
            <>
              <span className={styles.filterLabelShort}>{shortLabel}</span>
              <span className={styles.filterLabelLong}>{label}</span>
            </>
          )}
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
                <span>{allLabel}</span>
                <span className={styles.filterOptionCount}>{total}</span>
              </button>
            </li>
            {groups.map(({ group, items }) => (
              <Fragment key={group ?? "ungrouped"}>
                {group ? (
                  <li className={styles.filterGroupLabel} aria-hidden>
                    {group}
                  </li>
                ) : null}
                {items.map(renderOption)}
              </Fragment>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function CareerJobsList({
  postings,
  unavailable = false,
}: CareerJobsListProps) {
  const [location, setLocation] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(ROLES_PAGE_SIZE);

  const facets = useMemo<Facets>(
    () => ({ location, department, needle: normalizeQuery(query) }),
    [location, department, query],
  );

  /* Each dropdown is scoped by the *other* filters, so its rows and counts
     describe what is still reachable rather than the whole board. */
  const locationScope = useMemo(
    () => narrowPostings(postings, facets, "location"),
    [postings, facets],
  );
  const departmentScope = useMemo(
    () => narrowPostings(postings, facets, "department"),
    [postings, facets],
  );

  const locationOptions = useMemo(
    () => withSelected(buildLocationOptions(locationScope), location),
    [locationScope, location],
  );
  const departmentOptions = useMemo<SelectOption[]>(
    () => withSelected(buildDepartmentOptions(departmentScope), department),
    [departmentScope, department],
  );

  const hasFilters = location !== null || department !== null || query.trim() !== "";

  const ordered = useMemo(() => {
    const filtered = narrowPostings(postings, facets, null);
    if (hasFilters) return filtered;
    return [...filtered].sort(
      (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
    );
  }, [postings, facets, hasFilters]);

  const shown = ordered.slice(0, visible);

  /* Picking one facet can strand the other on a value that now yields nothing
     — "Legal" then a city with no Legal roles. Rather than leave an empty list
     with no visible cause, the stranded facet is released. */
  const selectLocation = useCallback(
    (next: string | null) => {
      setLocation(next);
      setVisible(ROLES_PAGE_SIZE);
      if (next === null || department === null) return;
      if (!pairIsReachable(postings, next, department)) setDepartment(null);
    },
    [postings, department],
  );

  const selectDepartment = useCallback(
    (next: string | null) => {
      setDepartment(next);
      setVisible(ROLES_PAGE_SIZE);
      if (next === null || location === null) return;
      if (!pairIsReachable(postings, location, next)) setLocation(null);
    },
    [postings, location],
  );

  const clearFilters = () => {
    setLocation(null);
    setDepartment(null);
    setQuery("");
    setVisible(ROLES_PAGE_SIZE);
  };

  return (
    <div className={styles.jobsInner}>
      <div className={styles.filters}>
        <div className={cx(styles.filterField, styles.filterFieldSearch)}>
          <input
            type="search"
            className={cx(styles.filterControl, styles.filterInput)}
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
        <SelectFilter
          label="Select department"
          shortLabel="Department"
          allLabel="All departments"
          options={departmentOptions}
          total={departmentScope.length}
          value={department}
          onChange={selectDepartment}
          className={styles.filterFieldDepartment}
        />
        <SelectFilter
          label="Select location"
          shortLabel="Location"
          allLabel="All locations"
          options={locationOptions}
          total={locationScope.length}
          value={location}
          onChange={selectLocation}
          className={styles.filterFieldLocation}
        />
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
                <span className={styles.departmentCount}>
                  {" "}
                  · {departmentScope.length}
                </span>
              </button>
            </li>
            {/* Same scoped list the mobile dropdown shows, so the sidebar
                narrows to the chosen location too. */}
            {departmentOptions.map((dept) => (
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
                      {/* Figma 24.07 `154:3579` stacks the department chip
                          above the title; the old side-by-side header put them
                          on one row. */}
                      <div className={styles.roleHeader}>
                        <span className={styles.rolePill}>
                          {posting.department ?? "Utopia"}
                        </span>
                        <h3 className={styles.roleTitle}>{posting.title}</h3>
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
