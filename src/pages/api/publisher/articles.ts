import type { APIRoute } from "astro";
import { listPublisherArticles, readPublisherArticle } from "@features/publisher/core/library";

export const GET: APIRoute = async ({ url }) => {
  try {
    const collection = url.searchParams.get("collection");
    const id = url.searchParams.get("id");
    if (collection && id) {
      const article = readPublisherArticle(collection, id);
      return json({ success: true, data: article });
    }
    return json({ success: true, data: listPublisherArticles() });
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
