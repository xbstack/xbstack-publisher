import type { APIRoute } from "astro";
import { buildPublisherPreview, parsePublisherMarkdown } from "@features/publisher/core/markdown";
import { createPublisherJob, readPublisherJobs } from "@features/publisher/core/storage";
import type { PublisherPlatform } from "@features/publisher/core/types";

const ALL_PLATFORMS = new Set(["wechat", "zhihu", "juejin", "xiaohongshu", "xbstack"]);

export const GET: APIRoute = async () => {
  return json({ success: true, data: readPublisherJobs() });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const platforms: PublisherPlatform[] = Array.isArray(body.platforms) && body.platforms.length
      ? body.platforms.filter((item: unknown): item is PublisherPlatform => typeof item === "string" && ALL_PLATFORMS.has(item))
      : ["wechat"];
    const article = body.article || parsePublisherMarkdown({ markdown: String(body.markdown || ""), source: body.source || "manual" });
    const preview = buildPublisherPreview(article, platforms);
    const job = createPublisherJob({
      title: preview.article.title,
      article: preview.article,
      platforms,
      theme: body.theme || "default",
    });
    return json({ success: true, data: job });
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
