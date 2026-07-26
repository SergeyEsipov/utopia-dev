import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import {
  DEFAULT_COMPANY_SLUG,
  OTHER_DEPARTMENT,
  buildApplyUrl,
  buildDepartments,
  buildDetailUrl,
  buildListUrl,
  findPostingBySlug,
  jobPostingExcerpt,
  matchesSlug,
  normalizeLocation,
  normalizePosting,
  normalizePostingDetail,
  toSlug,
} from "./revolut-people.ts";
import type { JobPostingSummary } from "./revolut-people.ts";

const FFE_RAW = {
  id: "d8423971-fc43-4f3e-8bf3-688227508c55",
  title: "FF&E Procurement Specialist",
  locations: [
    { name: "Brazil - Remote", type: "remote", country: { name: "Brazil" } },
    { name: "Colombia", type: "remote", country: { name: "United Kingdom" } },
  ],
  function: { name: "Procurement" },
  is_featured: false,
};

const CHEF_RAW = {
  id: "5a4e601f-06e3-430c-a56b-37a7f41d9e3d",
  title: "Private Head Chef",
  locations: [
    { name: "Barcelona", type: "office", country: { name: "Spain" } },
    { name: "Barcelona", type: "office", country: { name: "Spain" } },
    { name: "Spain", type: "remote", country: { name: "United Kingdom" } },
  ],
  function: null,
  is_featured: true,
};

const DESCRIPTION = `<h3>About the company</h3><p><p dir="ltr"><b><strong class="bold">Utopia</strong></b><span> is an ultra-luxury hospitality and lifestyle brand creating a global ecosystem of properties and experiences.</span></p></p><h3>Requirements</h3><p><ul><li>Law degree.</li></ul></p>`;

function summary(overrides: Partial<JobPostingSummary> = {}): JobPostingSummary {
  return {
    id: "d8423971-fc43-4f3e-8bf3-688227508c55",
    slug: "ff-e-procurement-specialist-d8423971",
    title: "FF&E Procurement Specialist",
    department: "Procurement",
    locations: [],
    offices: [],
    remote: [],
    isFeatured: false,
    applyUrl: buildApplyUrl("d8423971-fc43-4f3e-8bf3-688227508c55"),
    ...overrides,
  };
}

after(() => {
  delete process.env.REVOLUT_PEOPLE_COMPANY;
});

describe("revolut people urls", () => {
  it("derives every url from the default company slug", () => {
    delete process.env.REVOLUT_PEOPLE_COMPANY;

    assert.equal(DEFAULT_COMPANY_SLUG, "utopia-hq-ltd");
    assert.equal(
      buildListUrl(),
      "https://utopia-hq-ltd.revolutpeople.com/api/external/v2/postings",
    );
    assert.equal(
      buildDetailUrl("abc-def"),
      "https://utopia-hq-ltd.revolutpeople.com/api/external/v2/postings/abc-def",
    );
    assert.equal(
      buildApplyUrl("abc-def"),
      "https://utopia-hq-ltd.revolutpeople.com/public/careers/apply/abc-def",
    );
  });

  it("reads REVOLUT_PEOPLE_COMPANY lazily", () => {
    process.env.REVOLUT_PEOPLE_COMPANY = " another-co ";
    assert.equal(
      buildListUrl(),
      "https://another-co.revolutpeople.com/api/external/v2/postings",
    );

    process.env.REVOLUT_PEOPLE_COMPANY = "";
    assert.equal(
      buildListUrl(),
      "https://utopia-hq-ltd.revolutpeople.com/api/external/v2/postings",
    );
    delete process.env.REVOLUT_PEOPLE_COMPANY;
  });
});

describe("toSlug", () => {
  it("kebabs the title and appends the first uuid segment", () => {
    assert.equal(
      toSlug("FF&E Procurement Specialist", "d8423971-fc43-4f3e-8bf3-688227508c55"),
      "ff-e-procurement-specialist-d8423971",
    );
  });

  it("strips accents and collapses punctuation runs", () => {
    assert.equal(
      toSlug("Especialista en Jardinería y Paisajismo", "0a1b2c3d-0000"),
      "especialista-en-jardineria-y-paisajismo-0a1b2c3d",
    );
    assert.equal(toSlug("  Senior — Lead  ", "aaaabbbb-1"), "senior-lead-aaaabbbb");
  });

  it("falls back to the uuid segment when the title has no ascii", () => {
    assert.equal(toSlug("—", "abcd1234-ffff"), "abcd1234");
  });
});

describe("matchesSlug", () => {
  const posting = summary();

  it("matches the exact slug", () => {
    assert.equal(matchesSlug(posting, "ff-e-procurement-specialist-d8423971"), true);
  });

  it("matches a retitled posting on the uuid prefix", () => {
    assert.equal(matchesSlug(posting, "renamed-role-d8423971"), true);
  });

  it("rejects a mismatched or malformed tail", () => {
    assert.equal(matchesSlug(posting, "renamed-role-deadbeef"), false);
    assert.equal(matchesSlug(posting, "ff-e-procurement-specialist"), false);
    assert.equal(matchesSlug(posting, ""), false);
  });

  it("prefers an exact slug over a prefix match", () => {
    const other = summary({
      id: "d8423971-0000-0000-0000-000000000000",
      slug: "renamed-role-d8423971",
      title: "Renamed Role",
    });
    const found = findPostingBySlug([posting, other], "renamed-role-d8423971");

    assert.equal(found?.slug, "renamed-role-d8423971");
    assert.equal(findPostingBySlug([posting], "nope-12345678"), null);
  });
});

describe("normalizeLocation", () => {
  it("flattens country to a string", () => {
    assert.deepEqual(
      normalizeLocation({ name: "Barcelona", type: "office", country: { name: "Spain" } }),
      { name: "Barcelona", type: "office", country: "Spain" },
    );
  });

  it("tolerates a missing country", () => {
    assert.deepEqual(normalizeLocation({ name: "Remote", type: "remote" }), {
      name: "Remote",
      type: "remote",
      country: "",
    });
  });

  it("drops entries with an unusable name or type", () => {
    assert.equal(normalizeLocation({ name: "", type: "office" }), null);
    assert.equal(normalizeLocation({ name: "X", type: "hybrid" }), null);
    assert.equal(normalizeLocation(null), null);
    assert.equal(normalizeLocation("Barcelona"), null);
  });
});

describe("normalizePosting", () => {
  it("normalises a live list item", () => {
    assert.deepEqual(normalizePosting(FFE_RAW), {
      id: "d8423971-fc43-4f3e-8bf3-688227508c55",
      slug: "ff-e-procurement-specialist-d8423971",
      title: "FF&E Procurement Specialist",
      department: "Procurement",
      locations: [
        { name: "Brazil - Remote", type: "remote", country: "Brazil" },
        { name: "Colombia", type: "remote", country: "United Kingdom" },
      ],
      offices: [],
      remote: ["Brazil - Remote", "Colombia"],
      isFeatured: false,
      applyUrl:
        "https://utopia-hq-ltd.revolutpeople.com/public/careers/apply/d8423971-fc43-4f3e-8bf3-688227508c55",
    });
  });

  it("splits offices from remote and de-duplicates in api order", () => {
    const posting = normalizePosting(CHEF_RAW);

    assert.deepEqual(posting?.offices, ["Barcelona"]);
    assert.deepEqual(posting?.remote, ["Spain"]);
    assert.equal(posting?.department, null);
    assert.equal(posting?.isFeatured, true);
  });

  it("drops malformed payloads instead of throwing", () => {
    assert.equal(normalizePosting(null), null);
    assert.equal(normalizePosting([]), null);
    assert.equal(normalizePosting({ id: "x" }), null);
    assert.equal(normalizePosting({ id: 7, title: "T" }), null);
    assert.equal(normalizePosting({ id: "x-1", title: "   " }), null);
  });

  it("survives junk in locations, function and is_featured", () => {
    const posting = normalizePosting({
      id: "abcd1234-ffff",
      title: "Driver",
      locations: "everywhere",
      function: "Marine",
      is_featured: "yes",
    });

    assert.deepEqual(posting?.locations, []);
    assert.equal(posting?.department, null);
    assert.equal(posting?.isFeatured, false);

    const partial = normalizePosting({
      id: "abcd1234-ffff",
      title: "Driver",
      locations: [null, { name: "Madrid", type: "office", country: {} }],
    });
    assert.deepEqual(partial?.offices, ["Madrid"]);
  });
});

describe("normalizePostingDetail", () => {
  it("parses the description and carries the summary through", () => {
    const posting = normalizePostingDetail(summary(), {
      description: DESCRIPTION,
      presentation_video_url: null,
      creation_date_time: "2025-07-01T09:00:00Z",
    });

    assert.equal(posting.createdAt, "2025-07-01T09:00:00Z");
    assert.equal(posting.presentationVideoUrl, null);
    assert.deepEqual(
      posting.sections.map((section) => section.id),
      ["about-the-company", "requirements"],
    );
    assert.equal(posting.slug, "ff-e-procurement-specialist-d8423971");
  });

  it("degrades to an empty body when the detail request failed", () => {
    const posting = normalizePostingDetail(summary(), null);

    assert.deepEqual(posting.sections, []);
    assert.equal(posting.createdAt, null);
    assert.equal(posting.presentationVideoUrl, null);
    assert.equal(posting.title, "FF&E Procurement Specialist");
  });
});

describe("buildDepartments", () => {
  it("sorts by count desc then name, grouping a missing function as Other", () => {
    const postings = [
      summary({ department: "Marine" }),
      summary({ department: "Marine" }),
      summary({ department: "PMO" }),
      summary({ department: "Construction" }),
      summary({ department: null }),
    ];

    assert.deepEqual(buildDepartments(postings), [
      { name: "Marine", count: 2 },
      { name: "Construction", count: 1 },
      { name: OTHER_DEPARTMENT, count: 1 },
      { name: "PMO", count: 1 },
    ]);
    assert.deepEqual(buildDepartments([]), []);
  });
});

describe("jobPostingExcerpt", () => {
  const posting = normalizePostingDetail(summary(), { description: DESCRIPTION });

  it("flattens the first paragraph", () => {
    assert.equal(
      jobPostingExcerpt(posting, 400),
      "Utopia is an ultra-luxury hospitality and lifestyle brand creating a global ecosystem of properties and experiences.",
    );
  });

  it("skips the shared opening section when a later one has a paragraph", () => {
    const detailed = normalizePostingDetail(summary(), {
      description: `${DESCRIPTION}<h3>About the role</h3><p><p dir="ltr">You will lead FF&amp;E procurement.</p></p>`,
    });

    assert.equal(jobPostingExcerpt(detailed, 160), "You will lead FF&E procurement.");
  });

  it("cuts on a word boundary and appends an ellipsis", () => {
    const excerpt = jobPostingExcerpt(posting, 40);

    assert.equal(excerpt, "Utopia is an ultra-luxury hospitality…");
    assert.ok(excerpt.length <= 41);
  });

  it("returns an empty string when there is no paragraph", () => {
    const listOnly = normalizePostingDetail(summary(), {
      description: "<h3>A</h3><ul><li>only a list</li></ul>",
    });

    assert.equal(jobPostingExcerpt(listOnly, 160), "");
    assert.equal(jobPostingExcerpt(normalizePostingDetail(summary(), null), 160), "");
  });
});
