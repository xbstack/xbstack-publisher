import type { APIRoute } from "astro";
import { buildPublisherPreview, parsePublisherMarkdown } from "@features/publisher/core/markdown";
import type { PublisherPlatform } from "@features/publisher/core/types";
import { getPublisherStatus } from "@features/publisher/core/config";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const article = parsePublisherMarkdown({
      markdown: String(body.markdown || ""),
      id: body.id,
      collection: body.collection,
      source: body.source || "manual",
      assetMap: body.assetMap || {},
    });
    const platforms = Array.isArray(body.platforms) ? (body.platforms as PublisherPlatform[]) : undefined;
    return json({ success: true, data: buildPublisherPreview(article, platforms), status: getPublisherStatus() });
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
