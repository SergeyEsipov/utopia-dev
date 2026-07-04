import { readFileSync } from "node:fs";
import { join } from "node:path";

const SITE_DIR = join(process.cwd(), "src/site");

export function readSiteHtml(filename: string) {
  return readFileSync(join(SITE_DIR, filename), "utf8");
}

export function extractHeadHtml(html: string) {
  const match = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  return match?.[1]?.trim() ?? "";
}

export function extractBodyHtml(html: string) {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = match?.[1]?.trim() ?? "";
  return body.replace(/<script[\s\S]*?<\/script>\s*$/i, "").trim();
}

export function normalizePublicPath(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }

  return `/${path.replace(/^\.\//, "")}`;
}

export function extractBodyScript(html: string) {
  const match = html.match(/<body[\s\S]*?<script([^>]*)src="([^"]+)"[^>]*><\/script>\s*<\/body>/i);
  if (!match) {
    return null;
  }

  return {
    attrs: match[1] ?? "",
    src: match[2] ?? "",
  };
}
