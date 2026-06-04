import type { APIRoute } from "astro";
import { getPublisherStatus } from "@features/publisher/core/config";

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ success: true, data: getPublisherStatus() }), {
    headers: { "Content-Type": "application/json" },
  });
};
