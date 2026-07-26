export type InlineNode = { text: string; bold?: boolean; italic?: boolean };

export type JobDescriptionBlock =
  | { type: "paragraph"; content: InlineNode[] }
  | { type: "list"; ordered: boolean; items: InlineNode[][] };

export type JobDescriptionSection = {
  id: string;
  heading: string;
  blocks: JobDescriptionBlock[];
};

type Token =
  | { t: "text"; v: string }
  | { t: "open"; name: string }
  | { t: "close"; name: string };

type OpenList = { ordered: boolean; items: InlineNode[][]; cur: InlineNode[] };

type DraftSection = { base: string; heading: string; blocks: JobDescriptionBlock[] };

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: "\"",
  apos: "'",
};

const DROP_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "noscript",
  "svg",
]);

const VOID_TAGS = new Set(["br", "img", "hr", "input", "meta", "link"]);

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

const TAG_RE =
  /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^>"'])*)\/?>|<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>/g;

const ESCAPED_HEADING_RE =
  /&lt;(h[1-6])&gt;((?:[^<&]|<br\s*\/?>)*)&lt;\/\1&gt;/gi;

export function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity.charAt(0) === "#") {
      const hex = entity.charAt(1) === "x" || entity.charAt(1) === "X";
      const code = hex ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return match;
      return String.fromCodePoint(code);
    }
    const key = entity.toLowerCase();
    return Object.hasOwn(NAMED_ENTITIES, key) ? NAMED_ENTITIES[key] : match;
  });
}

export function slugifyHeading(heading: string): string {
  return heading
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function recoverEscapedHeadings(html: string): string {
  return html.replace(ESCAPED_HEADING_RE, (_match, _tag: string, inner: string) => {
    const text = inner.replace(/<br\s*\/?>/gi, " ").trim();
    return text ? `<h3>${text}</h3>` : "";
  });
}

function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  TAG_RE.lastIndex = 0;
  while ((match = TAG_RE.exec(html)) !== null) {
    if (match.index > last) tokens.push({ t: "text", v: html.slice(last, match.index) });
    const name = match[1];
    if (name) {
      tokens.push({
        t: match[0].charAt(1) === "/" ? "close" : "open",
        name: name.toLowerCase(),
      });
    }
    last = TAG_RE.lastIndex;
  }
  if (last < html.length) {
    const tail = html.slice(last).replace(/<[^>]*$/, "");
    if (tail) tokens.push({ t: "text", v: tail });
  }
  return tokens;
}

function pushInline(nodes: InlineNode[], text: string, bold: boolean, italic: boolean): void {
  if (!text) return;
  const prev = nodes[nodes.length - 1];
  if (prev && !!prev.bold === bold && !!prev.italic === italic) {
    prev.text += text;
    return;
  }
  const node: InlineNode = { text };
  if (bold) node.bold = true;
  if (italic) node.italic = true;
  nodes.push(node);
}

function mergeInline(nodes: InlineNode[], node: InlineNode): void {
  const prev = nodes[nodes.length - 1];
  if (prev && !!prev.bold === !!node.bold && !!prev.italic === !!node.italic) {
    prev.text = (prev.text + node.text).replace(/ {2,}/g, " ");
    return;
  }
  nodes.push(node);
}

function normalizeInline(nodes: InlineNode[]): InlineNode[] {
  const collapsed: InlineNode[] = [];
  for (const node of nodes) {
    const text = node.text.replace(/[\s\u00a0]+/g, " ");
    if (!text) continue;
    const blank = text.trim() === "";
    const next: InlineNode = { text };
    if (!blank && node.bold) next.bold = true;
    if (!blank && node.italic) next.italic = true;
    mergeInline(collapsed, next);
  }
  if (collapsed.length === 0) return collapsed;
  const first = collapsed[0];
  first.text = first.text.replace(/^ +/, "");
  const last = collapsed[collapsed.length - 1];
  last.text = last.text.replace(/ +$/, "");
  const merged: InlineNode[] = [];
  for (const node of collapsed) {
    if (node.text === "") continue;
    mergeInline(merged, node);
  }
  return merged;
}

function normalizeHeading(text: string): string {
  return text.replace(/[\s\u00a0]+/g, " ").trim();
}

export function parseJobDescription(html: string): JobDescriptionSection[] {
  if (typeof html !== "string" || html.trim() === "") return [];

  const tokens = tokenize(recoverEscapedHeadings(html));
  const preamble: JobDescriptionBlock[] = [];
  const sections: DraftSection[] = [];
  let current: DraftSection | null = null;
  let para: InlineNode[] = [];
  let list: OpenList | null = null;
  let bold = 0;
  let italic = 0;
  let drop = 0;
  let inHeading = false;
  let headingBuf: string[] = [];

  const target = () => (current ? current.blocks : preamble);
  const sink = () => (list ? list.cur : para);

  const flushPara = () => {
    const content = normalizeInline(para);
    para = [];
    if (content.length > 0) target().push({ type: "paragraph", content });
  };

  const flushListItem = () => {
    if (!list) return;
    const content = normalizeInline(list.cur);
    list.cur = [];
    if (content.length > 0) list.items.push(content);
  };

  const flushList = () => {
    if (!list) return;
    flushListItem();
    if (list.items.length > 0) {
      target().push({ type: "list", ordered: list.ordered, items: list.items });
    }
    list = null;
  };

  for (const token of tokens) {
    if (token.t === "text") {
      if (drop > 0) continue;
      const text = decodeEntities(token.v);
      if (inHeading) headingBuf.push(text);
      else pushInline(sink(), text, bold > 0, italic > 0);
      continue;
    }

    const name = token.name;

    if (DROP_TAGS.has(name)) {
      if (token.t === "open") drop += 1;
      else if (drop > 0) drop -= 1;
      continue;
    }
    if (drop > 0) continue;

    if (VOID_TAGS.has(name)) {
      if (name !== "br") continue;
      if (inHeading) headingBuf.push(" ");
      else pushInline(sink(), " ", bold > 0, italic > 0);
      continue;
    }

    if (HEADING_TAGS.has(name)) {
      if (token.t === "open") {
        flushList();
        flushPara();
        inHeading = true;
        headingBuf = [];
        continue;
      }
      if (!inHeading) continue;
      inHeading = false;
      const heading = normalizeHeading(headingBuf.join(""));
      headingBuf = [];
      current = { base: slugifyHeading(heading) || "section", heading, blocks: [] };
      sections.push(current);
      continue;
    }

    if (token.t === "open") {
      switch (name) {
        case "p":
        case "div":
        case "blockquote":
          if (!list) flushPara();
          break;
        case "ul":
        case "ol":
          flushPara();
          if (list) flushListItem();
          else list = { ordered: name === "ol", items: [], cur: [] };
          break;
        case "li":
          if (!list) list = { ordered: false, items: [], cur: [] };
          else flushListItem();
          break;
        case "b":
        case "strong":
          bold += 1;
          break;
        case "em":
        case "i":
          italic += 1;
          break;
        default:
          break;
      }
      continue;
    }

    switch (name) {
      case "p":
      case "div":
      case "blockquote":
        if (!list) flushPara();
        break;
      case "ul":
      case "ol":
        flushList();
        break;
      case "li":
        flushListItem();
        break;
      case "b":
      case "strong":
        if (bold > 0) bold -= 1;
        break;
      case "em":
      case "i":
        if (italic > 0) italic -= 1;
        break;
      default:
        break;
    }
  }

  flushList();
  flushPara();

  const drafts: DraftSection[] = [];
  if (preamble.length > 0) drafts.push({ base: "overview", heading: "", blocks: preamble });
  for (const section of sections) {
    if (section.blocks.length > 0) drafts.push(section);
  }

  const used = new Map<string, number>();
  return drafts.map((draft) => {
    const seen = used.get(draft.base) ?? 0;
    used.set(draft.base, seen + 1);
    return {
      id: seen === 0 ? draft.base : `${draft.base}-${seen + 1}`,
      heading: draft.heading,
      blocks: draft.blocks,
    };
  });
}
