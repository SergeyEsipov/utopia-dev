import assert from "node:assert/strict";
import { test } from "node:test";
import {
  departmentOptions,
  locationOptions,
  narrowPostings,
  normalizeQuery,
  pairIsReachable,
  withSelected,
  type Facets,
} from "./career-filters.ts";
import type { JobPostingSummary } from "./revolut-people.ts";

function posting(
  id: string,
  department: string | null,
  locations: [string, "office" | "remote"][],
  title = id,
): JobPostingSummary {
  return {
    id,
    slug: id,
    title,
    department,
    locations: locations.map(([name, type]) => ({ name, type, country: name })),
    offices: locations.filter(([, t]) => t === "office").map(([n]) => n),
    remote: locations.filter(([, t]) => t === "remote").map(([n]) => n),
    isFeatured: false,
    applyUrl: `https://example.test/${id}`,
  };
}

const POSTINGS: JobPostingSummary[] = [
  posting("marine-1", "Marine", [["Barcelona", "office"], ["Spain", "remote"]]),
  posting("marine-2", "Marine", [["Barcelona", "office"]]),
  posting("legal-1", "Legal", [["Cape Town", "office"]]),
  posting("ops-1", "Operations", [["Barcelona", "office"], ["Kenya", "remote"]]),
  posting("misc-1", null, [["Kenya", "remote"]]),
];

const NO_FACETS: Facets = { location: null, department: null, needle: "" };

test("no facets leaves every posting", () => {
  assert.equal(narrowPostings(POSTINGS, NO_FACETS, null).length, 5);
});

test("a facet left out of its own scope still sees the others", () => {
  const facets: Facets = { ...NO_FACETS, department: "Marine" };

  // The location list is built without the location facet, but with the
  // department one applied — that is what makes the two answer each other.
  const scope = narrowPostings(POSTINGS, facets, "location");
  assert.deepEqual(
    scope.map((p) => p.id),
    ["marine-1", "marine-2"],
  );
  assert.deepEqual(
    locationOptions(scope).map((o) => [o.name, o.count]),
    [
      ["Barcelona", 2],
      ["Spain", 1],
    ],
  );
});

test("choosing a location narrows the department list the same way", () => {
  const facets: Facets = { ...NO_FACETS, location: "Kenya" };
  const scope = narrowPostings(POSTINGS, facets, "department");
  assert.deepEqual(
    departmentOptions(scope).map((o) => [o.name, o.count]),
    [
      ["Operations", 1],
      ["Other", 1],
    ],
  );
});

test("a facet does not narrow itself, so its own rows stay selectable", () => {
  const facets: Facets = { ...NO_FACETS, location: "Barcelona" };
  const scope = narrowPostings(POSTINGS, facets, "location");
  const names = locationOptions(scope).map((o) => o.name);
  assert.ok(names.includes("Barcelona"));
  assert.ok(names.includes("Kenya"), "other locations remain offerable");
});

test("both facets together intersect", () => {
  const facets: Facets = {
    ...NO_FACETS,
    location: "Barcelona",
    department: "Marine",
  };
  assert.deepEqual(
    narrowPostings(POSTINGS, facets, null).map((p) => p.id),
    ["marine-1", "marine-2"],
  );
});

test("the search term applies to every scope", () => {
  const facets: Facets = { ...NO_FACETS, needle: normalizeQuery("legal") };
  assert.deepEqual(
    narrowPostings(POSTINGS, facets, "location").map((p) => p.id),
    ["legal-1"],
  );
});

test("a posting counts once per location even if it repeats", () => {
  const twice = [
    posting("dup", "Marine", [
      ["Barcelona", "office"],
      ["Barcelona", "office"],
    ]),
  ];
  assert.deepEqual(
    locationOptions(twice).map((o) => [o.name, o.count]),
    [["Barcelona", 1]],
  );
});

test("offices sort before remote, each alphabetically", () => {
  assert.deepEqual(
    locationOptions(POSTINGS).map((o) => `${o.group}:${o.name}`),
    [
      "Offices:Barcelona",
      "Offices:Cape Town",
      "Remote:Kenya",
      "Remote:Spain",
    ],
  );
});

test("a posting with no department falls into Other", () => {
  assert.ok(
    departmentOptions(POSTINGS).some((o) => o.name === "Other" && o.count === 1),
  );
});

test("withSelected keeps an out-of-scope selection clearable", () => {
  const scoped = [{ name: "Barcelona", count: 2 }];
  assert.deepEqual(withSelected(scoped, "Kenya"), [
    { name: "Barcelona", count: 2 },
    { name: "Kenya", count: 0 },
  ]);
  // Already present, or nothing selected — the list is returned untouched.
  assert.equal(withSelected(scoped, "Barcelona"), scoped);
  assert.equal(withSelected(scoped, null), scoped);
});

test("pairIsReachable tells a stranded combination from a live one", () => {
  assert.equal(pairIsReachable(POSTINGS, "Barcelona", "Marine"), true);
  assert.equal(pairIsReachable(POSTINGS, "Cape Town", "Marine"), false);
});
