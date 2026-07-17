import { NOT_FOUND_HREF } from "@/lib/routes";
import {
  termsGroups,
  type TermsBlock,
  type TermsChunk,
  type TermsParagraph,
} from "./terms-data";
import styles from "./terms.module.css";

function Paragraph({ paragraph }: { paragraph: TermsParagraph }) {
  if (typeof paragraph === "string") {
    return <p>{paragraph}</p>;
  }

  return (
    <p>
      {paragraph.map((part, index) =>
        part.underlined ? (
          <a key={index} href={NOT_FOUND_HREF} className={styles.inlineLink}>
            {part.text}
          </a>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </p>
  );
}

function Block({ block }: { block: TermsBlock }) {
  if (block.kind === "list") {
    const ListTag = block.style === "numbered" ? "ol" : "ul";
    return (
      <ListTag
        className={
          block.style === "numbered" ? styles.numberedList : styles.bulletList
        }
      >
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    );
  }

  return (
    <>
      {block.paragraphs.map((paragraph, index) => (
        <Paragraph key={index} paragraph={paragraph} />
      ))}
    </>
  );
}

function Chunk({ chunk }: { chunk: TermsChunk }) {
  return (
    <div className={styles.chunk}>
      {chunk.lead ? <p className={styles.lead}>{chunk.lead}</p> : null}
      <div className={styles.chunkBody}>
        {chunk.blocks.map((block, index) => (
          <Block key={index} block={block} />
        ))}
      </div>
    </div>
  );
}

export function TermsDocument() {
  return (
    <div className={styles.document}>
      <div className={styles.documentInner}>
        {termsGroups.map((group) => (
          <section
            key={group.id}
            className={styles.group}
            aria-labelledby={`terms-${group.id}`}
          >
            <h2 id={`terms-${group.id}`} className={styles.groupHeading}>
              {group.heading}
            </h2>
            {group.subsections.map((subsection) => (
              <div key={subsection.id} className={styles.subsection}>
                <h3 className={styles.subsectionHeading}>
                  {subsection.heading}
                </h3>
                {subsection.chunks.map((chunk, index) => (
                  <Chunk key={index} chunk={chunk} />
                ))}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
