import { jobOpeningContent } from "@/lib/career-data";
import { ApplyButton } from "./ApplyButton";
import type {
  InlineNode,
  JobDescriptionBlock,
  JobDescriptionSection,
} from "@/lib/job-description";
import { TERMS_HREF } from "@/lib/routes";
import styles from "./job-opening.module.css";

type JobDescriptionProps = {
  sections: JobDescriptionSection[];
  applyUrl: string;
};

type DefinitionItem = { title: string; body: InlineNode[] };

type RenderGroup =
  | { kind: "paragraphs"; paragraphs: InlineNode[][] }
  | { kind: "list"; ordered: boolean; items: InlineNode[][] };

const EMPTY_BODY =
  "The full description for this role is available on the application page.";

function trimBlankEdges(nodes: InlineNode[]): InlineNode[] {
  let start = 0;
  let end = nodes.length;
  while (start < end && nodes[start].text.trim() === "") start += 1;
  while (end > start && nodes[end - 1].text.trim() === "") end -= 1;
  return nodes.slice(start, end);
}

function asDefinitionItems(items: InlineNode[][]): DefinitionItem[] | null {
  const definitions: DefinitionItem[] = [];
  for (const nodes of items) {
    const [head, ...rest] = nodes;
    if (!head?.bold) return null;
    const body = trimBlankEdges(rest);
    if (body.length === 0) return null;
    definitions.push({ title: head.text.trim().replace(/[:\s]+$/, ""), body });
  }
  return definitions.length > 0 ? definitions : null;
}

function toGroups(blocks: JobDescriptionBlock[]): RenderGroup[] {
  const groups: RenderGroup[] = [];
  for (const block of blocks) {
    if (block.type === "list") {
      groups.push({ kind: "list", ordered: block.ordered, items: block.items });
      continue;
    }
    const last = groups[groups.length - 1];
    if (last && last.kind === "paragraphs") last.paragraphs.push(block.content);
    else groups.push({ kind: "paragraphs", paragraphs: [block.content] });
  }
  return groups;
}

function InlineText({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, index) =>
        node.bold ? (
          <strong key={index}>{node.text}</strong>
        ) : node.italic ? (
          <em key={index}>{node.text}</em>
        ) : (
          <span key={index}>{node.text}</span>
        ),
      )}
    </>
  );
}

function DefinitionList({ items }: { items: DefinitionItem[] }) {
  return (
    <ul className={styles.cardItems}>
      {items.map((item, index) => (
        <li key={index} className={styles.cardItem}>
          <p className={styles.cardItemTitle}>· {item.title}</p>
          <p className={styles.cardItemBody}>
            <InlineText nodes={item.body} />
          </p>
        </li>
      ))}
    </ul>
  );
}

function BulletList({
  ordered,
  items,
}: {
  ordered: boolean;
  items: InlineNode[][];
}) {
  const children = items.map((nodes, index) => (
    <li key={index}>
      {ordered ? `${index + 1}. ` : "· "}
      <InlineText nodes={nodes} />
    </li>
  ));
  return ordered ? (
    <ol className={styles.cardBody}>{children}</ol>
  ) : (
    <ul className={styles.cardBody}>{children}</ul>
  );
}

export function JobDescription({ sections, applyUrl }: JobDescriptionProps) {
  return (
    <section className={styles.description} aria-label="Job description">
      <div className={styles.card}>
        {sections.length === 0 ? (
          <section className={styles.cardSection}>
            <div className={styles.cardBody}>
              <p>{EMPTY_BODY}</p>
            </div>
          </section>
        ) : null}
        {sections.map((section) => {
          const groups = toGroups(section.blocks);
          const definitions = groups.map((group) =>
            group.kind === "list" ? asDefinitionItems(group.items) : null,
          );
          const hasDefinitions = definitions.some((entry) => entry !== null);
          const headingId = `job-section-${section.id}`;
          return (
            <section
              key={section.id}
              className={[
                styles.cardSection,
                hasDefinitions ? styles.cardSectionList : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-labelledby={section.heading ? headingId : undefined}
            >
              {section.heading ? (
                <h2 id={headingId} className={styles.cardHeading}>
                  {section.heading}
                </h2>
              ) : null}
              {groups.map((group, index) => {
                if (group.kind === "paragraphs") {
                  return (
                    <div key={index} className={styles.cardBody}>
                      {group.paragraphs.map((nodes, paragraphIndex) => (
                        <p key={paragraphIndex}>
                          <InlineText nodes={nodes} />
                        </p>
                      ))}
                    </div>
                  );
                }
                const items = definitions[index];
                return items ? (
                  <DefinitionList key={index} items={items} />
                ) : (
                  <BulletList
                    key={index}
                    ordered={group.ordered}
                    items={group.items}
                  />
                );
              })}
            </section>
          );
        })}
        <div className={styles.cardActions}>
          <ApplyButton applyUrl={applyUrl} className={styles.cardApply}>
            {jobOpeningContent.applyLabel}
          </ApplyButton>
          <a href={TERMS_HREF} className={styles.cardTerms}>
            {jobOpeningContent.termsLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
