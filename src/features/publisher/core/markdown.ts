import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { PublisherArticle, PublisherCheck, PublisherExport, PublisherImageRef, PublisherPlatform, PublisherPreview } from "./types";

const IMAGE_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;

export function parsePublisherMarkdown(input: {
  markdown: string;
  id?: string;
  collection?: string;
  filePath?: string;
  source?: PublisherArticle["source"];
  assetMap?: Record<string, string>;
}): PublisherArticle {
  const parsed = matter(input.markdown || "");
  const frontmatter = parsed.data || {};
  const body = input.assetMap ? replaceImageSources(parsed.content || "", input.assetMap) : parsed.content || "";
  const title = asString(frontmatter.title) || inferTitle(body) || input.id || "未命名文章";
  const slug = asString(frontmatter.slug) || input.id || slugify(title);
  const cover = asString(frontmatter.cover) || asString(frontmatter.image) || asString(frontmatter.featuredImg);
  const baseDir = input.filePath ? path.dirname(input.filePath) : undefined;
  const images = extractImages(body, baseDir, input.assetMap);

  return {
    id: input.id || slug,
    title,
    slug,
    collection: input.collection,
    filePath: input.filePath,
    source: input.source || "manual",
    markdown: body === parsed.content ? input.markdown || "" : matter.stringify(body, frontmatter),
    body,
    frontmatter,
    cover,
    author: asString(frontmatter.author),
    source_url: asString(frontmatter.source_url),
    images,
  };
}

export function buildPublisherPreview(article: PublisherArticle, platforms: PublisherPlatform[] = ["wechat", "zhihu", "juejin", "xiaohongshu", "xbstack"]): PublisherPreview {
  return {
    article,
    checks: buildChecks(article),
    exports: platforms.reduce<PublisherPreview["exports"]>((acc, platform) => {
      acc[platform] = buildPlatformExport(article, platform);
      return acc;
    }, {}),
  };
}

export function buildChecks(article: PublisherArticle): PublisherCheck[] {
  const checks: PublisherCheck[] = [];
  checks.push({
    key: "title",
    label: "标题",
    level: article.title && article.title !== "未命名文章" ? "ok" : "error",
    message: article.title && article.title !== "未命名文章" ? `已识别：${article.title}` : "缺少标题，请补充 title 或一级标题",
  });
  checks.push({
    key: "cover",
    label: "封面",
    level: article.cover ? "ok" : "warning",
    message: article.cover ? `封面：${article.cover}` : "未设置封面，可从正文第一张图或图片库选择",
  });
  checks.push({
    key: "images",
    label: "正文图片",
    level: article.images.some((img) => img.exists === false) ? "warning" : "ok",
    message: article.images.length ? `识别到 ${article.images.length} 张图片` : "正文未识别到图片",
  });
  checks.push({
    key: "wechat",
    label: "公众号草稿",
    level: "ok",
    message: "将通过服务端 Wenyan Server 创建草稿箱文章",
  });
  return checks;
}

export function buildPlatformExport(article: PublisherArticle, platform: PublisherPlatform): PublisherExport {
  if (platform === "xiaohongshu") {
    const clean = stripMarkdown(article.body).replace(/\n{3,}/g, "\n\n").trim();
    const tags = normalizeTags(article.frontmatter.tags);
    return {
      platform,
      title: article.title,
      format: "text",
      content: `${article.title}\n\n${clean}\n\n${tags.map((tag) => `#${tag}`).join(" ")}`.trim(),
      notes: ["小红书第一版生成复制文案，不自动登录发布", "图片请按图片清单人工上传"],
    };
  }

  if (platform === "xbstack") {
    return {
      platform,
      title: article.title,
      format: "mdx",
      content: article.markdown,
      notes: ["站内发布副本，不自动覆盖原始文章"],
    };
  }

  return {
    platform,
    title: article.title,
    format: "markdown",
    content: article.markdown,
    notes: platform === "wechat" ? ["微信公众号将调用 Wenyan Server 创建草稿"] : ["复制到平台编辑器后发布"],
  };
}

export function composeWechatMarkdown(article: PublisherArticle, theme = "default") {
  const data = { ...article.frontmatter };
  data.title = article.title;
  if (article.cover) data.cover = article.cover;
  if (article.author) data.author = article.author;
  if (article.source_url) data.source_url = article.source_url;
  data.theme = theme;
  return matter.stringify(article.body, data);
}

function extractImages(body: string, baseDir?: string, assetMap?: Record<string, string>): PublisherImageRef[] {
  const images: PublisherImageRef[] = [];
  let match: RegExpExecArray | null;
  while ((match = IMAGE_RE.exec(body)) !== null) {
    const src = match[2].trim();
    const mapped = assetMap?.[src] || assetMap?.[src.replace(/^\.\//, "")];
    const isRemote = /^https?:\/\//i.test(src) || src.startsWith("/");
    const resolvedSrc = mapped || (isRemote || !baseDir ? src : path.resolve(baseDir, src));
    const exists = /^https?:\/\//i.test(resolvedSrc) || resolvedSrc.startsWith("/") ? undefined : fs.existsSync(resolvedSrc);
    images.push({ alt: match[1], src, resolvedSrc, exists, isRemote: /^https?:\/\//i.test(src) });
  }
  return images;
}

function replaceImageSources(body: string, assetMap: Record<string, string>) {
  return body.replace(IMAGE_RE, (full, alt: string, src: string) => {
    const cleanSrc = src.trim();
    const replacement = findAssetReplacement(cleanSrc, assetMap);
    return replacement ? `![${alt}](${replacement})` : full;
  });
}

function findAssetReplacement(src: string, assetMap: Record<string, string>) {
  const candidates = [
    src,
    src.replace(/^\.\//, ""),
    src.split("/").slice(-1)[0],
    src.split("/").slice(-2).join("/"),
  ];
  return candidates.map((item) => assetMap[item]).find(Boolean);
}

function inferTitle(body: string) {
  const heading = body.match(/^#\s+(.+)$/m);
  return heading?.[1]?.trim();
}

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`~-]/g, "")
    .trim();
}

function normalizeTags(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value.split(/[,，\s]+/).filter(Boolean);
  return [];
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `article-${Date.now()}`;
}
