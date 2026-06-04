import type { PublisherArticle, PublisherJobResult, PublisherPlatform } from "../core/types";
import { buildPlatformExport } from "../core/markdown";

export function exportPlatform(article: PublisherArticle, platform: PublisherPlatform): PublisherJobResult {
  const exported = buildPlatformExport(article, platform);
  return {
    platform,
    status: "export_ready",
    message: `${platform} 导出内容已生成`,
    content: exported.content,
    data: { format: exported.format, notes: exported.notes || [] },
  };
}
