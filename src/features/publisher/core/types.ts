export type PublisherPlatform = "wechat" | "zhihu" | "juejin" | "xiaohongshu" | "xbstack";

export type PublisherJobStatus =
  | "pending"
  | "publishing"
  | "draft_created"
  | "export_ready"
  | "failed";

export interface PublisherImageRef {
  alt: string;
  src: string;
  resolvedSrc?: string;
  exists?: boolean;
  isRemote: boolean;
}

export interface PublisherArticle {
  id: string;
  title: string;
  slug?: string;
  collection?: string;
  filePath?: string;
  source?: "library" | "manual" | "folder";
  markdown: string;
  body: string;
  frontmatter: Record<string, unknown>;
  cover?: string;
  author?: string;
  source_url?: string;
  images: PublisherImageRef[];
}

export interface PublisherPreview {
  article: PublisherArticle;
  checks: PublisherCheck[];
  exports: Partial<Record<PublisherPlatform, PublisherExport>>;
}

export interface PublisherCheck {
  key: string;
  label: string;
  level: "ok" | "warning" | "error";
  message: string;
}

export interface PublisherExport {
  platform: PublisherPlatform;
  title: string;
  content: string;
  format: "markdown" | "text" | "mdx" | "draft";
  notes?: string[];
}

export interface PublisherJob {
  id: string;
  title: string;
  article: PublisherArticle;
  platforms: PublisherPlatform[];
  theme: string;
  status: PublisherJobStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  results: Partial<Record<PublisherPlatform, PublisherJobResult>>;
  error?: string;
}

export interface PublisherJobResult {
  platform: PublisherPlatform;
  status: PublisherJobStatus;
  message: string;
  data?: Record<string, unknown>;
  content?: string;
  error?: string;
}

export interface PublisherConfig {
  mode: "server" | "local";
  wenyanServerUrl?: string;
  wenyanApiKey?: string;
  wenyanPublishPath: string;
  storagePath: string;
  assetDir: string;
  publicAssetBaseUrl?: string;
}
