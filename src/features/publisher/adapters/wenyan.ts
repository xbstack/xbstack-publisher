import fs from "fs";
import os from "os";
import path from "path";
import type { PublisherArticle, PublisherJobResult } from "../core/types";
import { composeWechatMarkdown } from "../core/markdown";
import { getPublisherConfig } from "../core/config";

export async function publishWechatDraft(article: PublisherArticle, theme: string): Promise<PublisherJobResult> {
  const config = getPublisherConfig();
  if (!config.wenyanServerUrl || !config.wenyanApiKey) {
    return {
      platform: "wechat",
      status: "failed",
      message: "Wenyan Server 未配置",
      error: "请配置 WENYAN_SERVER_URL 和 WENYAN_API_KEY",
    };
  }

  const markdown = composeWechatMarkdown(article, theme);
  const tempPath = path.join(os.tmpdir(), `${article.slug || article.id}-${Date.now()}.md`);
  fs.writeFileSync(tempPath, markdown);

  try {
    const endpoint = new URL(config.wenyanPublishPath, config.wenyanServerUrl).toString();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.wenyanApiKey}`,
      },
      body: JSON.stringify({
        title: article.title,
        markdown,
        theme,
        cover: article.cover,
        author: article.author,
        source_url: article.source_url,
        filePath: tempPath,
      }),
    });

    const text = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      return {
        platform: "wechat",
        status: "failed",
        message: `Wenyan Server 返回 ${response.status}`,
        error: String(data.error || data.message || text || "发布失败"),
        data,
      };
    }

    return {
      platform: "wechat",
      status: "draft_created",
      message: "已创建微信公众号草稿",
      data,
    };
  } catch (error) {
    return {
      platform: "wechat",
      status: "failed",
      message: "无法连接 Wenyan Server",
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    try {
      fs.unlinkSync(tempPath);
    } catch {
      // temp cleanup is best-effort
    }
  }
}
