import {
  buildDepartments,
  OTHER_DEPARTMENT,
  type JobPostingSummary,
} from "./revolut-people.ts";

/** One row of a filter dropdown. `group` heads a section of the list. */
export type SelectOption = { name: string; count: number; group?: string };

export type Facets = {
  location: string | null;
  department: string | null;
  /** Already normalised by `normalizeQuery`; "" means no search. */
  needle: string;
};

/** Which facet to leave out of a scope — see `narrowPostings`. */
export type FacetName = "location" | "department";

export function normalizeQuery(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function departmentKey(posting: JobPostingSummary): string {
  return posting.department ?? OTHER_DEPARTMENT;
}

export function atLocation(posting: JobPostingSummary, name: string): boolean {
  return posting.locations.some((location) => location.name === name);
}

export function matchesQuery(
  posting: JobPostingSummary,
  needle: string,
): boolean {
  if (needle === "") return true;
  return (
    normalizeQuery(posting.title).includes(needle) ||
    normalizeQuery(posting.department ?? "").includes(needle)
  );
}

/**
 * Postings that satisfy every facet except `except`.
 *
 * Leaving a facet out of its own scope is what makes the two dropdowns answer
 * each other: the Location list is built from the roles that already match the
 * chosen Department, and vice versa, so each list only ever offers values that
 * still lead somewhere. `except: null` gives the fully filtered set the page
 * renders.
 */
export function narrowPostings(
  postings: JobPostingSummary[],
  facets: Facets,
  except: FacetName | null,
): JobPostingSummary[] {
  return postings.filter((posting) => {
    if (
      except !== "location" &&
      facets.location !== null &&
      !atLocation(posting, facets.location)
    ) {
      return false;
    }
    if (
      except !== "department" &&
      facets.department !== null &&
      departmentKey(posting) !== facets.department
    ) {
      return false;
    }
    return matchesQuery(posting, facets.needle);
  });
}

/** Offices first, then remote, each alphabetical — the order Figma draws. */
export function locationOptions(
  postings: JobPostingSummary[],
): SelectOption[] {
  const seenPerPosting = new Map<
    string,
    { name: string; type: "office" | "remote"; count: number }
  >();
  for (const posting of postings) {
    const counted = new Set<string>();
    for (const location of posting.locations) {
      if (counted.has(location.name)) continue;
      counted.add(location.name);
      const existing = seenPerPosting.get(location.name);
      if (existing) existing.count += 1;
      else
        seenPerPosting.set(location.name, {
          name: location.name,
          type: location.type,
          count: 1,
        });
    }
  }
  return [...seenPerPosting.values()]
    .sort(
      (a, b) =>
        (a.type === b.type ? 0 : a.type === "office" ? -1 : 1) ||
        a.name.localeCompare(b.name),
    )
    .map(({ name, count, type }) => ({
      name,
      count,
      group: type === "office" ? "Offices" : "Remote",
    }));
}

export function departmentOptions(
  postings: JobPostingSummary[],
): SelectOption[] {
  return buildDepartments(postings).map(({ name, count }) => ({ name, count }));
}

/**
 * Keeps the active value selectable even when the other facets exclude it —
 * otherwise a search term could hide the only row that clears the filter.
 */
export function withSelected(
  options: SelectOption[],
  value: string | null,
): SelectOption[] {
  if (value === null || options.some((option) => option.name === value)) {
    return options;
  }
  return [...options, { name: value, count: 0 }];
}

/** Whether any role still joins these two facet values. */
export function pairIsReachable(
  postings: JobPostingSummary[],
  location: string,
  department: string,
): boolean {
  return postings.some(
    (posting) =>
      atLocation(posting, location) && departmentKey(posting) === department,
  );
}
