import { parseJobDescription } from "./job-description.ts";
import type { JobDescriptionBlock, JobDescriptionSection } from "./job-description.ts";

export type JobLocation = {
  name: string;
  type: "remote" | "office";
  country: string;
};

export type JobPostingSummary = {
  id: string;
  slug: string;
  title: string;
  department: string | null;
  locations: JobLocation[];
  offices: string[];
  remote: string[];
  isFeatured: boolean;
  applyUrl: string;
};

export type JobPosting = JobPostingSummary & {
  createdAt: string | null;
  presentationVideoUrl: string | null;
  sections: JobDescriptionSection[];
};

export type JobDepartment = { name: string; count: number };

export const DEFAULT_COMPANY_SLUG = "utopia-hq-ltd";
export const OTHER_DEPARTMENT = "Other";

const REVALIDATE_SECONDS = 900;
const POSTINGS_TAG = "revolut-people-postings";
const LIST_TIMEOUT_MS = 8000;
const DETAIL_TIMEOUT_MS = 8000;
const UUID_PREFIX_RE = /^[0-9a-f]{8}$/i;

function companySlug(): string {
  return process.env.REVOLUT_PEOPLE_COMPANY?.trim() || DEFAULT_COMPANY_SLUG;
}

function apiBase(): string {
  return `https://${companySlug()}.revolutpeople.com`;
}

export function buildListUrl(): string {
  return `${apiBase()}/api/external/v2/postings`;
}

export function buildDetailUrl(id: string): string {
  return `${apiBase()}/api/external/v2/postings/${encodeURIComponent(id)}`;
}

export function buildApplyUrl(id: string): string {
  return `${apiBase()}/public/careers/apply/${encodeURIComponent(id)}`;
}

export function toSlug(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = id.split("-")[0] ?? "";
  if (!base) return suffix || id;
  return suffix ? `${base}-${suffix}` : base;
}

export function matchesSlug(posting: JobPostingSummary, slug: string): boolean {
  if (!slug) return false;
  if (posting.slug === slug) return true;
  const tail = slug.split("-").pop() ?? "";
  if (!UUID_PREFIX_RE.test(tail)) return false;
  return posting.id.toLowerCase().startsWith(`${tail.toLowerCase()}-`);
}

export function findPostingBySlug(
  postings: JobPostingSummary[],
  slug: string,
): JobPostingSummary | null {
  return (
    postings.find((posting) => posting.slug === slug) ??
    postings.find((posting) => matchesSlug(posting, slug)) ??
    null
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export function normalizeLocation(raw: unknown): JobLocation | null {
  const item = asRecord(raw);
  if (!item) return null;
  const name = asString(item.name);
  if (!name) return null;
  const type = item.type === "office" ? "office" : item.type === "remote" ? "remote" : null;
  if (!type) return null;
  const country = asRecord(item.country);
  return { name, type, country: (country && asString(country.name)) || "" };
}

function uniqueNames(locations: JobLocation[], type: JobLocation["type"]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const location of locations) {
    if (location.type !== type || seen.has(location.name)) continue;
    seen.add(location.name);
    names.push(location.name);
  }
  return names;
}

export function normalizePosting(raw: unknown): JobPostingSummary | null {
  const item = asRecord(raw);
  if (!item) return null;
  const id = asString(item.id);
  const title = asString(item.title);
  if (!id || !title) return null;
  const locations = Array.isArray(item.locations)
    ? item.locations.flatMap((entry) => normalizeLocation(entry) ?? [])
    : [];
  const fn = asRecord(item.function);
  return {
    id,
    slug: toSlug(title, id),
    title,
    department: (fn && asString(fn.name)) || null,
    locations,
    offices: uniqueNames(locations, "office"),
    remote: uniqueNames(locations, "remote"),
    isFeatured: item.is_featured === true,
    applyUrl: buildApplyUrl(id),
  };
}

export function normalizePostingDetail(
  summary: JobPostingSummary,
  raw: unknown,
): JobPosting {
  const item = asRecord(raw);
  const description = item ? asString(item.description) : null;
  return {
    ...summary,
    createdAt: (item && asString(item.creation_date_time)) || null,
    presentationVideoUrl: (item && asString(item.presentation_video_url)) || null,
    sections: description ? parseJobDescription(description) : [],
  };
}

export function buildDepartments(postings: JobPostingSummary[]): JobDepartment[] {
  const counts = new Map<string, number>();
  for (const posting of postings) {
    const name = posting.department ?? OTHER_DEPARTMENT;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function firstParagraph(
  sections: JobDescriptionSection[],
): Extract<JobDescriptionBlock, { type: "paragraph" }> | null {
  for (const section of sections) {
    for (const block of section.blocks) {
      if (block.type === "paragraph") return block;
    }
  }
  return null;
}

export function jobPostingExcerpt(posting: JobPosting, max: number): string {
  // The opening section is company boilerplate identical across every posting,
  // so prefer the first role-specific paragraph after it.
  const first =
    firstParagraph(posting.sections.slice(1)) ?? firstParagraph(posting.sections);
  if (!first) return "";
  const text = first.content
    .map((node) => node.text)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(" ", max);
  return `${text.slice(0, cut > 0 ? cut : max).trimEnd()}…`;
}

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
    next: { revalidate: REVALIDATE_SECONDS, tags: [POSTINGS_TAG] },
  });
  if (!res.ok) throw new Error(`revolut-people: ${res.status} from ${url}`);
  return res.json();
}

async function fetchJsonOrNull(url: string, timeoutMs: number): Promise<unknown | null> {
  try {
    return await fetchJson(url, timeoutMs);
  } catch (error) {
    console.warn(
      `revolut-people: request failed for ${url}`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

function toPostings(data: unknown): JobPostingSummary[] | null {
  if (!Array.isArray(data)) return null;
  return data.flatMap((raw) => normalizePosting(raw) ?? []);
}

export async function getJobPostings(): Promise<JobPostingSummary[] | null> {
  return toPostings(await fetchJsonOrNull(buildListUrl(), LIST_TIMEOUT_MS));
}

export async function fetchJobPostings(): Promise<JobPostingSummary[]> {
  return (await getJobPostings()) ?? [];
}

// Upstream failures propagate instead of collapsing to null: the caller answers
// null with notFound(), and a cached 404 would outlive the outage by a full
// revalidate window.
export async function getJobPosting(slug: string): Promise<JobPosting | null> {
  const listUrl = buildListUrl();
  const postings = toPostings(await fetchJson(listUrl, LIST_TIMEOUT_MS));
  if (!postings) throw new Error(`revolut-people: unexpected payload from ${listUrl}`);
  const summary = findPostingBySlug(postings, slug);
  if (!summary) return null;
  const detail = await fetchJson(buildDetailUrl(summary.id), DETAIL_TIMEOUT_MS);
  return normalizePostingDetail(summary, detail);
}

export async function fetchJobPosting(slug: string): Promise<JobPosting | null> {
  return getJobPosting(slug);
}

export async function getJobDepartments(): Promise<JobDepartment[]> {
  return buildDepartments(await fetchJobPostings());
}
