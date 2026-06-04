import type { APIRoute } from "astro";
import { getPublisherJob } from "@features/publisher/core/storage";

export const GET: APIRoute = async ({ params }) => {
  const job = getPublisherJob(String(params.id || ""));
  if (!job) return json({ success: false, error: "任务不存在" }, 404);
  return json({ success: true, data: job });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
