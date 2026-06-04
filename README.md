# XBSTACK Publisher

> Markdown-first publishing workspace for creators, indie hackers, and technical writers.

XBSTACK Publisher is an open-source content publishing workspace designed to help creators import, edit, format, manage images, and distribute one piece of content to multiple platforms.

Current focus: **Markdown articles -> WeChat Official Account draft box**, with copy-ready exports for Zhihu, Juejin, Xiaohongshu, and personal websites.

中文定位：

> XBSTACK Publisher 是一个面向创作者、独立开发者和技术写作者的开源内容发布工作台。它以 Markdown 为核心，支持文章导入、编辑、图片管理、封面设置、多平台导出，并通过 Wenyan Server 将文章发布到微信公众号草稿箱。

## Current Version

```text
v0.1.0-alpha
```

This alpha version is usable as a standalone Astro app. The current publishing flow is intentionally conservative: WeChat can publish to the draft box through Wenyan Server, while other platforms generate copy-ready exports.

## Features

### Content Sources

- Paste Markdown manually.
- Import a browser-selected folder containing `.md` / `.mdx` files and images.
- Build a queue from imported articles for batch processing.
- Edit a publishing copy without overwriting the original article.

### Markdown Editing

- Markdown-first editor workflow.
- Front Matter parsing.
- Title, author, cover, slug, and source URL recognition.
- Automatic title fallback from the first `# H1` heading.
- Markdown preview data for platform exports.

### Image Workflow

Implemented in `v0.1.0-alpha`:

- Upload images to the publishing asset library.
- Insert uploaded images into Markdown.
- Select images from the asset library.
- Set an image as the article cover.
- Set the first body image as the cover.
- Preserve image metadata for publishing checks.

Planned next:

- Paste image files directly from the clipboard.
- Automatically upload pasted images into the asset library.
- Insert pasted images as Markdown: `![alt](url)`.
- Paste image URLs and show inline image previews.
- Insert a pasted image URL into the body.
- Set a pasted image URL as the cover.
- Download and rehost remote image URLs into the local asset library.
- Drag and drop images into the editor.
- Batch-manage images imported from folders or pasted from the clipboard.

### WeChat Official Account Publishing

- Publish Markdown articles to WeChat Official Account drafts through Wenyan Server.
- Keep WeChat credentials on the server side.
- Support local preview and NAS deployment through the same Wenyan Server.
- Track publishing status and errors in publishing jobs.

### Multi-Platform Export

| Platform | Current capability |
| --- | --- |
| WeChat Official Account | Publish to draft box through Wenyan Server |
| Zhihu | Copy-ready Markdown / rich-text oriented export |
| Juejin | Copy-ready Markdown export |
| Xiaohongshu | Copy-ready title, body, topics, and image list |
| Personal website | Markdown/MDX publishing copy |

### Publishing Jobs

- Create publishing jobs.
- Track job status.
- Store platform results.
- Preserve error messages for failed publishing attempts.
- Keep export output available for copy-based platforms.

## Architecture

```text
Admin UI
  -> Publisher API
    -> Publisher Core
      -> Platform Adapters
        -> Wenyan Server
        -> Copy-ready exporters
```

Main parts:

- `src/features/publisher/components`: React publishing workspace.
- `src/features/publisher/core`: Markdown parsing, configuration, storage, and shared types.
- `src/features/publisher/adapters`: Wenyan publishing adapter and copy-export adapters.
- `src/pages/api/publisher`: API routes for previews, imports, assets, jobs, and publishing.

Security model:

- The browser never reads `WECHAT_APP_SECRET` or `WENYAN_API_KEY`.
- WeChat publishing is executed server-side.
- Wenyan Server is responsible for creating WeChat drafts.

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Then open:

```text
http://localhost:4321/admin/publisher/
```

## Environment Variables

```env
PUBLISHER_MODE=server
WENYAN_SERVER_URL=https://your-wenyan-server
WENYAN_API_KEY=your-api-key
WENYAN_PUBLISH_PATH=/api/publish
PUBLISHER_STORAGE_PATH=data/publisher/jobs.json
PUBLISHER_ASSET_DIR=public/assets/uploads
PUBLISHER_PUBLIC_ASSET_BASE_URL=
```

Optional future fallback:

```env
WENYAN_LOCAL_ENABLED=false
WECHAT_APP_ID=your-app-id
WECHAT_APP_SECRET=your-app-secret
```

## WeChat Publishing Setup

XBSTACK Publisher uses Wenyan Server for WeChat Official Account draft publishing.

Recommended deployment:

```text
Browser UI
  -> XBSTACK Publisher API
    -> Wenyan Server
      -> WeChat Official Account API
```

Why:

- The local browser does not need to be added to the WeChat IP whitelist.
- A NAS or server can hold the stable IP and credentials.
- The frontend never exposes sensitive secrets.

## Current Limitations

- WeChat publishing depends on Wenyan Server.
- Zhihu, Juejin, and Xiaohongshu are copy-export only in this version.
- Publishing jobs are stored in local JSON instead of a database.
- Clipboard image paste, remote image rehosting, and drag-and-drop images are planned but not implemented yet.
- Video publishing and AI workflows are planned but not implemented yet.

## Roadmap

### Short Term

- Docker Compose deployment.
- Single-user mode.
- Direct clipboard image paste.
- Auto-upload pasted images into the asset library.
- Image URL paste with preview.
- Remote image download and rehosting.
- Drag-and-drop image upload.
- Better WeChat article preview.
- Theme/template system.
- Database-backed publishing jobs.

### Mid Term

- AI polishing and rewriting.
- AI dynamic layout suggestions.
- AI title generation.
- AI summary generation.
- AI Xiaohongshu copy rewriting.
- AI trend discovery.
- AI creative inspiration.
- AI SEO / GEO optimization.
- AI multi-platform style conversion.
- AI content data analysis.

### Long Term

- Publish videos to WeChat Channels.
- Publish videos to Douyin.
- Publish videos to Kuaishou.
- Publish videos to YouTube.
- Publish videos to Bilibili.
- Video breakdown and script extraction.
- Viral content structure analysis.
- Video script generation.
- Multi-platform post-publishing analytics.
- Content asset library.
- Editorial calendar.
- Team collaboration.

## Open Source Boundary

Safe to open source:

- Publisher core.
- Platform adapters.
- Admin UI components.
- API route shapes.
- Documentation and deployment examples.

Keep private in production:

- Production `WENYAN_API_KEY`.
- WeChat app credentials.
- Real publishing history.
- Private templates.
- Commercial content workflows.

## License

Apache-2.0. See [LICENSE](./LICENSE).

## Acknowledgements

- [Wenyan](https://github.com/caol64/wenyan)
- [Wenyan MCP](https://github.com/caol64/wenyan-mcp)
