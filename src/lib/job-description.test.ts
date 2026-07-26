import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decodeEntities,
  parseJobDescription,
  slugifyHeading,
} from "./job-description.ts";
import type { InlineNode, JobDescriptionSection } from "./job-description.ts";

const ABOUT_THE_COMPANY = `<h3>About the company</h3><p><p dir="ltr" style="text-align: start;"><b><strong class="bold">Utopia</strong></b><span> is an ultra-luxury hospitality and lifestyle brand creating a global ecosystem of properties and experiences. </span></p></p>`;

const ENTITY_PARAGRAPH = `<h3>About the role</h3><p><p>This position will work closely&nbsp;with Interior Designers and Senior FF&amp;E Procurement Specialist to maintain FF&amp;E budgets.</p></p>`;

const SPACER_AND_LABELLED_LIST = `<h3>At a glance</h3><p><ul><li>Payment Forecast and Cost control</li><li>Logistic, Delivery and Installation plus Handover</li></ul><p><br></p><p><strong>Key role outcomes:</strong></p><ul><li><strong>Segment-Specific Sourcing:</strong> Develop and execute strategic sourcing plans specifically tailored for the OS&amp;E/FF&amp;E</li></ul></p>`;

const ORDERED_THEN_UNORDERED = `<h3>Responsibilities</h3><p><ol><li class="ql-indent-1">Monthly financial reporting;</li><li class="ql-indent-1">Assisting in external audits.</li></ol><ul><li>Prepare and review regulatory reports in collaboration with the team.</li></ul></p>`;

const ESCAPED_HEADINGS = `<h3>About the role</h3><p><p>Deep expertise in construction law, procurement, commercial contracting, and project risk management.</p>&lt;h3&gt;Responsibilities&lt;/h3&gt;<ul><li>Serve as the lead legal advisor on high-value international projects.</li></ul><p><br></p></p><h3>Requirements</h3><p>&lt;h3&gt;<br>&lt;/h3&gt;<ul><li>Law degree and qualification to practice law in at least one jurisdiction.</li></ul></p>`;

const BLANK_BOLD = `<h3>About the role</h3><p><p>We are hiring for a high-end luxury accommodation project in Barcelona, Spain. <strong> </strong>If you're not already based there, relocation will be necessary.</p></p>`;

const ITALIC_NOTE = `<h3>About the role</h3><p><em>This is a freelance / on-call position</em>, active during the principals' stays at the property.</p>`;

const FAKE_BULLET = `<h3>Requirements</h3><p><ul><li>Professional level of English, both written and verbal</li><li>Good to have:</li></ul><p>\t•Experience in projects in the Caribbean region</p></p>`;

const CORPUS_FIXTURES = [
  ABOUT_THE_COMPANY,
  ENTITY_PARAGRAPH,
  SPACER_AND_LABELLED_LIST,
  ORDERED_THEN_UNORDERED,
  ESCAPED_HEADINGS,
  BLANK_BOLD,
  ITALIC_NOTE,
  FAKE_BULLET,
];

function paragraph(section: JobDescriptionSection, index: number): InlineNode[] {
  const block = section.blocks[index];
  assert.equal(block.type, "paragraph");
  return block.type === "paragraph" ? block.content : [];
}

function list(section: JobDescriptionSection, index: number): InlineNode[][] {
  const block = section.blocks[index];
  assert.equal(block.type, "list");
  return block.type === "list" ? block.items : [];
}

function flatten(nodes: InlineNode[]): string {
  return nodes.map((node) => node.text).join("");
}

describe("parseJobDescription structure", () => {
  it("flattens the bogus outer <p> and collapses doubled bold", () => {
    const sections = parseJobDescription(ABOUT_THE_COMPANY);

    assert.deepEqual(sections, [
      {
        id: "about-the-company",
        heading: "About the company",
        blocks: [
          {
            type: "paragraph",
            content: [
              { text: "Utopia", bold: true },
              {
                text: " is an ultra-luxury hospitality and lifestyle brand creating a global ecosystem of properties and experiences.",
              },
            ],
          },
        ],
      },
    ]);
  });

  it("decodes &nbsp; and &amp; into a single text node", () => {
    const [section] = parseJobDescription(ENTITY_PARAGRAPH);
    const content = paragraph(section, 0);

    assert.equal(content.length, 1);
    assert.equal(
      content[0].text,
      "This position will work closely with Interior Designers and Senior FF&E Procurement Specialist to maintain FF&E budgets.",
    );
  });

  it("drops <p><br></p> spacers and keeps bold-lead list items", () => {
    const [section] = parseJobDescription(SPACER_AND_LABELLED_LIST);

    assert.equal(section.blocks.length, 3);
    assert.equal(list(section, 0).length, 2);
    assert.deepEqual(paragraph(section, 1), [
      { text: "Key role outcomes:", bold: true },
    ]);
    assert.deepEqual(list(section, 2)[0], [
      { text: "Segment-Specific Sourcing:", bold: true },
      {
        text: " Develop and execute strategic sourcing plans specifically tailored for the OS&E/FF&E",
      },
    ]);
  });

  it("keeps an <ol> and a following <ul> as two blocks", () => {
    const [section] = parseJobDescription(ORDERED_THEN_UNORDERED);

    assert.equal(section.blocks.length, 2);
    assert.deepEqual(section.blocks[0], {
      type: "list",
      ordered: true,
      items: [
        [{ text: "Monthly financial reporting;" }],
        [{ text: "Assisting in external audits." }],
      ],
    });
    assert.equal(
      section.blocks[1].type === "list" ? section.blocks[1].ordered : true,
      false,
    );
  });

  it("recovers double-encoded headings and drops the empty one", () => {
    const sections = parseJobDescription(ESCAPED_HEADINGS);

    assert.deepEqual(
      sections.map((section) => section.id),
      ["about-the-role", "responsibilities", "requirements"],
    );
    assert.ok(!/[<>]/.test(JSON.stringify(sections)));
    assert.equal(sections[2].blocks.length, 1);
  });

  it("swallows a whitespace-only <strong> without doubling the space", () => {
    const [section] = parseJobDescription(BLANK_BOLD);
    const content = paragraph(section, 0);

    assert.equal(content.length, 1);
    assert.ok(!content[0].text.includes("  "));
    assert.ok(content[0].text.includes("Spain. If you're"));
  });

  it("marks <em> runs as italic", () => {
    const [section] = parseJobDescription(ITALIC_NOTE);

    assert.deepEqual(paragraph(section, 0), [
      { text: "This is a freelance / on-call position", italic: true },
      { text: ", active during the principals' stays at the property." },
    ]);
  });

  it("keeps a faked tab-and-bullet line as a paragraph", () => {
    const [section] = parseJobDescription(FAKE_BULLET);

    assert.equal(section.blocks.length, 2);
    assert.deepEqual(paragraph(section, 1), [
      { text: "•Experience in projects in the Caribbean region" },
    ]);
  });

  it("flattens a nested list into its parent, preserving order", () => {
    const [section] = parseJobDescription(
      "<h3>A</h3><ul><li>a<ul><li>nested</li></ul></li></ul>",
    );

    assert.equal(section.blocks.length, 1);
    assert.deepEqual(list(section, 0), [[{ text: "a" }], [{ text: "nested" }]]);
  });

  it("treats <br> as a space and drops all-whitespace sections", () => {
    const [section] = parseJobDescription("<h3>A</h3><p>line1<br>line2</p>");

    assert.deepEqual(paragraph(section, 0), [{ text: "line1 line2" }]);
    assert.deepEqual(
      parseJobDescription("<h3>A</h3><p><br></p><p>  </p><p>&nbsp;</p>"),
      [],
    );
  });

  it("merges adjacent nodes of identical formatting", () => {
    const [merged] = parseJobDescription("<h3>A</h3><p>a<b>b</b><b>c</b>d</p>");
    assert.deepEqual(paragraph(merged, 0), [
      { text: "a" },
      { text: "bc", bold: true },
      { text: "d" },
    ]);

    const [nested] = parseJobDescription("<h3>A</h3><p><b><i>both</i></b> plain</p>");
    assert.deepEqual(paragraph(nested, 0), [
      { text: "both", bold: true, italic: true },
      { text: " plain" },
    ]);
  });
});

describe("parseJobDescription sections", () => {
  it("returns an empty array for empty input and never throws", () => {
    assert.deepEqual(parseJobDescription(""), []);
    assert.deepEqual(parseJobDescription("   "), []);
    assert.deepEqual(parseJobDescription(undefined as unknown as string), []);
    assert.deepEqual(parseJobDescription(null as unknown as string), []);
    assert.deepEqual(parseJobDescription(42 as unknown as string), []);
  });

  it("emits content before the first heading as an overview section", () => {
    const sections = parseJobDescription("<p>lead paragraph</p><h3>A</h3><p>b</p>");

    assert.equal(sections.length, 2);
    assert.equal(sections[0].id, "overview");
    assert.equal(sections[0].heading, "");
    assert.deepEqual(paragraph(sections[0], 0), [{ text: "lead paragraph" }]);
  });

  it("wraps a heading-less document in a single overview section", () => {
    const sections = parseJobDescription("no h3 at all <p>hello <b>world</b></p>");

    assert.equal(sections.length, 1);
    assert.deepEqual(sections[0], {
      id: "overview",
      heading: "",
      blocks: [
        { type: "paragraph", content: [{ text: "no h3 at all" }] },
        {
          type: "paragraph",
          content: [{ text: "hello " }, { text: "world", bold: true }],
        },
      ],
    });
  });

  it("suffixes ids of repeated headings", () => {
    const sections = parseJobDescription(
      "<h3>Requirements</h3><p>one</p><h3>Requirements</h3><p>two</p>",
    );

    assert.deepEqual(
      sections.map((section) => section.id),
      ["requirements", "requirements-2"],
    );
  });

  it("normalises heading text and slugs", () => {
    const [amp] = parseJobDescription(
      "<h3>  Location &amp; Collaboration Format  </h3><p>x</p>",
    );
    assert.equal(amp.heading, "Location & Collaboration Format");
    assert.equal(amp.id, "location-collaboration-format");

    const [dash] = parseJobDescription("<h3>—</h3><p>x</p>");
    assert.equal(dash.id, "section");

    const [accented] = parseJobDescription(
      "<h3>Especialista en Jardinería</h3><p>x</p>",
    );
    assert.equal(accented.id, "especialista-en-jardineria");
    assert.equal(accented.heading, "Especialista en Jardinería");
  });
});

describe("parseJobDescription hostile input", () => {
  it("drops script and style content entirely", () => {
    const sections = parseJobDescription(
      `<script>alert("<h3>x</h3>")</script><style>p{content:"<h3>"}</style><h3>A</h3><p>ok</p>`,
    );

    assert.equal(sections.length, 1);
    assert.deepEqual(paragraph(sections[0], 0), [{ text: "ok" }]);
    assert.ok(!JSON.stringify(sections).includes("alert"));
  });

  it("drops void tags and their attributes", () => {
    const [section] = parseJobDescription(
      "<h3>A</h3><p>x<img src=y onerror=alert(1)>z</p>",
    );

    assert.deepEqual(paragraph(section, 0), [{ text: "xz" }]);
  });

  it("survives unbalanced and truncated markup", () => {
    const [unclosed] = parseJobDescription("<h3>A</h3><p>unclosed <b>bold");
    assert.deepEqual(paragraph(unclosed, 0), [
      { text: "unclosed " },
      { text: "bold", bold: true },
    ]);

    const [stray] = parseJobDescription("<h3>A</h3></b></p></ul><p>stray closers</p>");
    assert.deepEqual(paragraph(stray, 0), [{ text: "stray closers" }]);

    const [truncated] = parseJobDescription("<h3>A</h3><p>a</p");
    assert.deepEqual(paragraph(truncated, 0), [{ text: "a" }]);
  });

  it("decodes entities exactly once, so they can never become markup", () => {
    const [section] = parseJobDescription("<h3>A</h3><p>5 &lt; 10 &amp;&amp; 10 &gt; 5</p>");

    assert.deepEqual(paragraph(section, 0), [{ text: "5 < 10 && 10 > 5" }]);
  });

  it("leaves unknown entities verbatim", () => {
    assert.equal(decodeEntities("&bogus; &amp; &#65; &#x42;"), "&bogus; & A B");
    assert.equal(decodeEntities("&#1114112;"), "&#1114112;");
  });
});

describe("parseJobDescription corpus invariants", () => {
  it("holds for every corpus fixture", () => {
    for (const html of CORPUS_FIXTURES) {
      const sections = parseJobDescription(html);
      assert.ok(sections.length > 0);

      const ids = new Set<string>();
      for (const section of sections) {
        assert.ok(!ids.has(section.id));
        ids.add(section.id);
        assert.ok(section.id !== "");
        assert.ok(section.blocks.length > 0);

        const runs = section.blocks.flatMap((block) =>
          block.type === "paragraph" ? [block.content] : block.items,
        );
        for (const nodes of runs) {
          assert.ok(nodes.length > 0);
          for (const node of nodes) assert.notEqual(node.text, "");
          assert.doesNotMatch(flatten(nodes), / {2,}|^\s|\s$|[<>]/);
        }
      }
    }
  });

  it("slugifies headings deterministically", () => {
    assert.equal(slugifyHeading("Responsibilities:"), "responsibilities");
    assert.equal(slugifyHeading("Sobre la vacante"), "sobre-la-vacante");
    assert.equal(slugifyHeading("—"), "");
  });
});
