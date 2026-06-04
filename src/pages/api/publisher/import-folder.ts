import type { APIRoute } from "astro";
import { buildPublisherPreview, parsePublisherMarkdown } from "@features/publisher/core/markdown";

interface ImportAsset {
  name: string;
  path: string;
  url: string;
}

interface ImportFile {
  name: string;
  path: string;
  content: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const files: ImportFile[] = Array.isArray(body.files) ? body.files : [];
    const assets: ImportAsset[] = Array.isArray(body.assets) ? body.assets : [];
    const assetMap = assets.reduce<Record<string, string>>((acc: Record<string, string>, item: ImportAsset) => {
      if (item.path && item.url) {
        acc[item.path] = item.url;
        acc[item.name] = item.url;
        acc[String(item.path).split("/").slice(1).join("/")] = item.url;
        acc[String(item.path).split("/").slice(-2).join("/")] = item.url;
      }
      return acc;
    }, {});

    const articles = files
      .filter((file) => /\.(md|mdx)$/i.test(String(file.name || file.path || "")))
      .map((file: ImportFile, index: number) => {
        const article = parsePublisherMarkdown({
          markdown: String(file.content || ""),
          id: String(file.path || file.name || `import-${index}`).replace(/\.(md|mdx)$/i, ""),
          source: "folder",
          assetMap,
        });
        return buildPublisherPreview(article);
      });

    return json({
      success: true,
      data: {
        batchId: `batch_${Date.now()}`,
        importedAt: new Date().toISOString(),
        articles,
        assets,
      },
    });
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
