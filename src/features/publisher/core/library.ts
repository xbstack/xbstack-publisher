import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { parsePublisherMarkdown } from "./markdown";

const CONTENT_ROOT = path.resolve(process.cwd(), "src/content");
const ALLOWED_COLLECTIONS = new Set(["ai", "archive", "horizon", "lens", "notes", "newsletter", "posts", "pages"]);

export function listPublisherArticles() {
  const files = walkContentFiles(CONTENT_ROOT);
  return files.map((filePath) => {
    const markdown = fs.readFileSync(filePath, "utf-8");
    const relative = path.relative(CONTENT_ROOT, filePath);
    const [collection] = relative.split(path.sep);
    const id = relative.replace(/\.(md|mdx)$/i, "").split(path.sep).slice(1).join("/");
    const parsed = matter(markdown);
    return {
      id,
      collection,
      title: String(parsed.data.title || parsed.data.name || id),
      description: String(parsed.data.description || parsed.data.seoDescription || ""),
      cover: String(parsed.data.cover || parsed.data.image || parsed.data.featuredImg || ""),
      filePath,
      relativePath: relative,
    };
  });
}

export function readPublisherArticle(collection: string, id: string) {
  const safeCollection = sanitizePathPart(collection);
  const safeId = id.split("/").map(sanitizePathPart).join(path.sep);
  const mdPath = path.join(CONTENT_ROOT, safeCollection, `${safeId}.md`);
  const mdxPath = path.join(CONTENT_ROOT, safeCollection, `${safeId}.mdx`);
  const filePath = fs.existsSync(mdPath) ? mdPath : mdxPath;
  if (!fs.existsSync(filePath)) throw new Error("Article not found");
  const markdown = fs.readFileSync(filePath, "utf-8");
  return parsePublisherMarkdown({ markdown, id, collection, filePath, source: "library" });
}

function walkContentFiles(root: string) {
  if (!fs.existsSync(root)) return [];
  const result: string[] = [];
  for (const collection of fs.readdirSync(root)) {
    if (!ALLOWED_COLLECTIONS.has(collection)) continue;
    const dir = path.join(root, collection);
    if (!fs.statSync(dir).isDirectory()) continue;
    walk(dir, result);
  }
  return result;
}

function walk(dir: string, result: string[]) {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) walk(fullPath, result);
    else if (/\.(md|mdx)$/i.test(entry)) result.push(fullPath);
  }
}

function sanitizePathPart(value: string) {
  return value.replace(/^\.+/, "").replace(/[\\:]/g, "").replace(/\.\./g, "");
}
