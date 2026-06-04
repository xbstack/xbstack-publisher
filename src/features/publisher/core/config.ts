import path from "path";
import type { PublisherConfig } from "./types";

export function getPublisherConfig(): PublisherConfig {
  return {
    mode: process.env.PUBLISHER_MODE === "local" ? "local" : "server",
    wenyanServerUrl: process.env.WENYAN_SERVER_URL,
    wenyanApiKey: process.env.WENYAN_API_KEY,
    wenyanPublishPath: process.env.WENYAN_PUBLISH_PATH || "/api/publish",
    storagePath: path.resolve(process.cwd(), process.env.PUBLISHER_STORAGE_PATH || "data/publisher/jobs.json"),
    assetDir: path.resolve(process.cwd(), process.env.PUBLISHER_ASSET_DIR || "public/assets/uploads"),
    publicAssetBaseUrl: process.env.PUBLISHER_PUBLIC_ASSET_BASE_URL,
  };
}

export function getPublisherStatus() {
  const config = getPublisherConfig();
  return {
    mode: config.mode,
    wenyanConfigured: Boolean(config.wenyanServerUrl && config.wenyanApiKey),
    wenyanServerUrl: config.wenyanServerUrl ? maskUrl(config.wenyanServerUrl) : "",
    wenyanPublishPath: config.wenyanPublishPath,
    assetDir: config.assetDir,
    storagePath: config.storagePath,
  };
}

function maskUrl(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url.replace(/(.{12}).+/, "$1...");
  }
}
