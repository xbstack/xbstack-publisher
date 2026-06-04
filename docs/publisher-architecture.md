# XBSTACK Publisher Architecture

XBSTACK Publisher is a standalone Astro/React app with the main workspace at `/admin/publisher/`. The reusable publishing logic lives under `src/features/publisher`.

## Runtime Model

- The browser admin UI never reads WeChat secrets.
- The Astro API routes create jobs, upload assets, generate exports, and call Wenyan Server.
- Wenyan Server is responsible for WeChat Official Account draft creation.
- Local preview and NAS deployment should both use `WENYAN_SERVER_URL`, so the local machine does not need to be added to the WeChat IP whitelist.

## Environment

```env
PUBLISHER_MODE=server
WENYAN_SERVER_URL=https://your-wenyan-server
WENYAN_API_KEY=your-api-key
WENYAN_PUBLISH_PATH=/api/publish
PUBLISHER_STORAGE_PATH=data/publisher/jobs.json
PUBLISHER_ASSET_DIR=public/assets/uploads
PUBLISHER_PUBLIC_ASSET_BASE_URL=
```

## Open Source Boundary

Open-source modules:

- `src/features/publisher/core`
- `src/features/publisher/adapters`
- `src/features/publisher/components`
- Publisher API route shape and documentation

Keep private:

- XBSTACK admin authentication
- production `WENYAN_API_KEY`
- WeChat app credentials
- real publishing history
- private templates and commercial content workflows

## v1 Capabilities

- Select articles from the existing content library.
- Paste Markdown manually.
- Import a folder from the browser with Markdown and images.
- Upload, insert, select, and set cover images.
- Publish WeChat drafts through Wenyan Server.
- Generate copy-ready exports for Zhihu, Juejin, Xiaohongshu, and XBSTACK.

## Open Source README

The public repository README lives at the project root:

```text
README.md
```

## Planned Image Workflow

The current version supports uploading, inserting, selecting, and setting cover images. The next image workflow milestone should add:

- paste image files directly from the clipboard;
- auto-upload pasted images into the asset library;
- insert pasted images as Markdown;
- paste image URLs and show previews;
- set pasted image URLs as covers;
- download and rehost remote image URLs;
- drag and drop images into the editor;
- batch-manage imported or pasted images.

These items are planned and should not be described as completed in public release notes until implemented.

## Roadmap Snapshot

Short term:

- standalone open-source repository;
- Docker Compose deployment;
- single-user mode;
- clipboard image paste;
- image URL paste preview;
- remote image rehosting;
- drag-and-drop upload;
- better WeChat preview;
- template system;
- database-backed publishing jobs.

Mid term:

- AI polishing;
- AI dynamic layout;
- AI title and summary generation;
- AI Xiaohongshu rewriting;
- AI trend discovery;
- AI creative inspiration;
- AI SEO / GEO optimization;
- AI multi-platform style conversion;
- AI content data analysis.

Long term:

- video publishing to WeChat Channels, Douyin, Kuaishou, YouTube, and Bilibili;
- video breakdown and script extraction;
- viral content structure analysis;
- video script generation;
- post-publishing analytics;
- content asset library;
- editorial calendar;
- team collaboration.
