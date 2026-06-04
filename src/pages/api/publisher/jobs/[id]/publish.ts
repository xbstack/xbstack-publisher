import type { APIRoute } from "astro";
import { updatePublisherJob } from "@features/publisher/core/storage";
import { exportPlatform } from "@features/publisher/adapters/exports";
import { publishWechatDraft } from "@features/publisher/adapters/wenyan";

export const POST: APIRoute = async ({ params }) => {
  const id = String(params.id || "");
  try {
    let working = updatePublisherJob(id, (job) => ({ ...job, status: "publishing", updatedAt: new Date().toISOString(), error: undefined }));
    const results = { ...working.results };

    for (const platform of working.platforms) {
      if (platform === "wechat") results[platform] = await publishWechatDraft(working.article, working.theme);
      else results[platform] = exportPlatform(working.article, platform);
    }

    const hasFailure = Object.values(results).some((result) => result?.status === "failed");
    const hasDraft = results.wechat?.status === "draft_created";
    const status = hasFailure ? "failed" : hasDraft ? "draft_created" : "export_ready";
    working = updatePublisherJob(id, (job) => ({
      ...job,
      status,
      results,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      error: hasFailure ? Object.values(results).find((result) => result?.error)?.error : undefined,
    }));

    return json({ success: !hasFailure, data: working, error: working.error });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return json({ success: false, error: message }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
