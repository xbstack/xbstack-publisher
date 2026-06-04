# XBSTACK Publisher

> Markdown-first multi-platform publishing workspace for creators, indie hackers, and technical writers.

[中文](#中文) | [English](#english)

---

## 中文

XBSTACK Publisher 是一个面向创作者、独立开发者和技术写作者的开源内容发布工作台。它以 Markdown 为核心，支持文章导入、编辑、图片管理、封面设置、多平台导出，并通过 Wenyan Server 将文章发布到微信公众号草稿箱。

当前版本重点解决：

```text
Markdown 文章 -> 微信公众号草稿箱
Markdown 文章 -> 知乎 / 掘金 / 小红书 / 个人网站复制导出
```

### 当前版本

```text
v0.1.0-alpha
```

这是一个 alpha 版本。当前已经可以作为独立 Astro 应用运行，但仍处于早期开源阶段。微信公众号支持草稿箱发布，知乎、掘金、小红书当前为复制导出。

### 功能概览

#### 内容来源

- 手动粘贴 Markdown。
- 从浏览器选择文件夹批量导入 `.md` / `.mdx` 文件和图片。
- 导入后生成文章队列，适合连续处理多篇内容。
- 发布前编辑的是发布副本，不会直接覆盖原始文章。

#### Markdown 编辑

- Markdown-first 编辑体验。
- 支持 Front Matter 解析。
- 自动识别标题、作者、封面、slug、source URL。
- 没有 `title` 时，可从第一个 `# H1` 推断标题。
- 支持为多平台生成预览和导出内容。

#### 图片工作流

已实现：

- 上传图片到本地发布资产库。
- 将上传图片插入 Markdown 正文。
- 从图片库选择图片。
- 设置文章封面。
- 将正文第一张图片设为封面。
- 发布前保留图片引用，用于预检查。

计划中：

- 从剪贴板直接粘贴图片文件。
- 粘贴图片后自动上传到资产库。
- 上传成功后自动插入 Markdown：`![alt](url)`。
- 粘贴图片 URL 后自动识别并显示图片预览。
- 将粘贴的图片 URL 插入正文。
- 将粘贴的图片 URL 一键设为封面。
- 将远程图片 URL 下载并转存到本地资产库。
- 拖拽图片上传。
- 批量管理导入或粘贴得到的图片。

#### 微信公众号草稿箱发布

- 通过 Wenyan Server 发布到微信公众号草稿箱。
- 微信密钥和 Wenyan API Key 只在服务端读取。
- 本地预览、NAS 部署、服务器部署都可以调用同一个 Wenyan Server。
- 支持记录发布任务状态和错误信息。

#### 多平台导出

| 平台 | 当前能力 |
| --- | --- |
| 微信公众号 | 通过 Wenyan Server 发布到草稿箱 |
| 知乎 | 生成可复制 Markdown / 富文本导出内容 |
| 掘金 | 生成可复制 Markdown |
| 小红书 | 生成标题、正文、话题和图片清单 |
| 个人网站 | 生成 Markdown / MDX 发布副本 |

#### 发布任务

- 创建发布任务。
- 记录任务状态。
- 保存平台结果。
- 记录失败原因。
- 为复制导出平台保留导出文本。

### 硬件与系统要求

#### 最低要求

| 项目 | 要求 |
| --- | --- |
| CPU | 1 核 |
| 内存 | 512 MB 可用内存 |
| 磁盘 | 300 MB，不含上传图片 |
| Node.js | 18 或更高 |
| 包管理器 | pnpm 9 或更高，推荐 pnpm 10 |
| 操作系统 | macOS、Linux、Windows、NAS Linux 环境 |

#### 推荐要求

| 场景 | 推荐配置 |
| --- | --- |
| 本地开发 | 2 核 CPU、2 GB 内存 |
| 家用 NAS / 飞牛 NAS | 2 核 CPU、2 GB 内存、持久化数据目录 |
| 公开服务器 | 2 核 CPU、4 GB 内存、HTTPS、反向代理 |
| 大量图片处理 | 预留独立图片存储目录或对象存储 |

#### 浏览器要求

- Chrome / Edge / Safari / Firefox 的现代版本。
- 文件夹导入依赖浏览器目录选择能力，Chromium 系浏览器兼容性最好。

### 架构

```text
Browser UI
  -> Publisher API
    -> Publisher Core
      -> Platform Adapters
        -> Wenyan Server
        -> Copy-ready exporters
```

主要目录：

```text
src/features/publisher/components   # React 发布工作台
src/features/publisher/core         # Markdown 解析、配置、存储、共享类型
src/features/publisher/adapters     # Wenyan 与多平台导出适配器
src/pages/api/publisher             # 预览、导入、图片、任务、发布 API
```

安全模型：

- 浏览器不读取 `WECHAT_APP_SECRET`。
- 浏览器不读取 `WENYAN_API_KEY`。
- 微信公众号发布在服务端执行。
- Wenyan Server 负责真正创建微信公众号草稿。

### 本地部署

#### 1. 克隆仓库

```bash
git clone git@github.com:xbstack/xbstack-publisher.git
cd xbstack-publisher
```

也可以使用 HTTPS：

```bash
git clone https://github.com/xbstack/xbstack-publisher.git
cd xbstack-publisher
```

#### 2. 安装依赖

```bash
pnpm install
```

#### 3. 创建环境变量

```bash
cp .env.example .env
```

最小可运行配置可以先保持示例值。此时微信发布不可用，但编辑、导入、图片上传和多平台导出可以使用。

#### 4. 启动开发服务

```bash
pnpm dev
```

打开：

```text
http://localhost:4321/admin/publisher/
```

#### 5. 构建生产版本

```bash
pnpm build
pnpm preview
```

### NAS / 服务器部署建议

#### 推荐拓扑

```text
你的浏览器
  -> XBSTACK Publisher
    -> Wenyan Server
      -> 微信公众号 API
```

这样做的好处：

- 本机不需要加入微信公众号 IP 白名单。
- 只需要把 NAS 或服务器 IP 加入微信公众号后台白名单。
- 微信密钥只放在服务端或 Wenyan Server。
- 多台电脑都可以通过浏览器使用同一个发布后台。

#### 生产环境建议

- 使用 `pnpm build` 构建。
- 使用 Node 进程管理器、Docker、systemd 或 NAS 自带服务管理器运行。
- 使用 Nginx、Caddy、Cloudflare Tunnel 或 NAS 反向代理提供 HTTPS。
- 将 `data/publisher` 和 `public/assets/uploads` 设置为持久化目录。
- 不要把 `.env` 提交到 Git。

### 环境变量

```env
PUBLISHER_MODE=server
WENYAN_SERVER_URL=https://your-wenyan-server
WENYAN_API_KEY=your-api-key
WENYAN_PUBLISH_PATH=/api/publish
PUBLISHER_STORAGE_PATH=data/publisher/jobs.json
PUBLISHER_ASSET_DIR=public/assets/uploads
PUBLISHER_PUBLIC_ASSET_BASE_URL=
```

说明：

| 变量 | 说明 |
| --- | --- |
| `PUBLISHER_MODE` | 当前默认使用 `server` |
| `WENYAN_SERVER_URL` | Wenyan Server 地址 |
| `WENYAN_API_KEY` | 调用 Wenyan Server 的服务端密钥 |
| `WENYAN_PUBLISH_PATH` | Wenyan 发布接口路径，默认 `/api/publish` |
| `PUBLISHER_STORAGE_PATH` | 发布任务 JSON 存储路径 |
| `PUBLISHER_ASSET_DIR` | 图片上传目录 |
| `PUBLISHER_PUBLIC_ASSET_BASE_URL` | 可选，图片公开访问基础 URL |

未来可能支持的本地模式变量：

```env
WENYAN_LOCAL_ENABLED=false
WECHAT_APP_ID=your-app-id
WECHAT_APP_SECRET=your-app-secret
```

### 微信公众号发布配置

要发布到微信公众号草稿箱，你需要：

1. 一个已配置好的微信公众号。
2. 可用的 `WECHAT_APP_ID` 和 `WECHAT_APP_SECRET`。
3. 一个可访问微信公众号 API 的 Wenyan Server。
4. 将 Wenyan Server 所在机器的公网 IP 加入微信公众号后台 IP 白名单。
5. 在 XBSTACK Publisher 的 `.env` 中配置：

```env
WENYAN_SERVER_URL=https://your-wenyan-server
WENYAN_API_KEY=your-api-key
WENYAN_PUBLISH_PATH=/api/publish
```

注意：

- XBSTACK Publisher 不会自动群发文章，只创建草稿箱内容。
- 如果 Wenyan Server 无法访问图片 URL，建议使用 `PUBLISHER_PUBLIC_ASSET_BASE_URL` 或把 Publisher 与 Wenyan Server 部署在同一台机器。
- 微信密钥不要放进前端代码，也不要提交到 GitHub。

### 使用教程

#### 手动粘贴文章

1. 打开 `/admin/publisher/`。
2. 选择「粘贴」来源。
3. 将 Markdown 粘贴到编辑器。
4. 点击「预检查」。
5. 选择目标平台。
6. 点击发布/导出。

#### 文件夹批量导入

1. 准备一个本地文件夹。
2. 将 `.md` / `.mdx` 和图片放在同一个文件夹或子文件夹中。
3. 在页面选择「导入」。
4. 点击「选择文件夹导入」。
5. 系统会上传图片、解析文章并生成队列。
6. 逐篇检查标题、封面、图片状态。
7. 批量发布或导出。

#### 上传并插入图片

1. 点击「上传并插入图片」。
2. 选择本地图片。
3. 图片会进入 `public/assets/uploads`。
4. 编辑器会插入 Markdown 图片语法。

#### 设置封面

可使用三种方式：

- 上传图片后设为封面。
- 从图片库选择图片设为封面。
- 将正文第一张图片设为封面。

#### 发布到微信公众号草稿箱

1. 确认 `.env` 已配置 Wenyan Server。
2. 选择「微信公众号」平台。
3. 点击发布。
4. 发布成功后，在微信公众号后台草稿箱检查内容。

#### 导出到其他平台

1. 勾选知乎、掘金、小红书或个人网站。
2. 点击发布/导出。
3. 在「多平台导出预览」中复制内容。
4. 粘贴到对应平台编辑器。

### 常用命令

```bash
pnpm dev       # 本地开发
pnpm build     # 生产构建
pnpm preview   # 预览构建产物
pnpm check     # Astro / TypeScript 检查
```

### 当前限制

- 微信公众号发布依赖 Wenyan Server。
- 知乎、掘金、小红书当前是复制导出，不是自动发布。
- 发布任务目前存储在本地 JSON 文件中。
- 剪贴板图片粘贴、远程图片转存、拖拽上传还未实现。
- 视频发布和 AI 工作流还未实现。

### Roadmap

#### 短期

- Docker Compose 部署。
- 单用户模式。
- 剪贴板图片直接粘贴。
- 粘贴图片自动上传。
- 图片 URL 粘贴预览。
- 远程图片下载并转存。
- 拖拽图片上传。
- 更好的微信公众号预览。
- 主题模板系统。
- 发布任务数据库化。

#### 中期

- AI 润色和改写。
- AI 动态排版建议。
- AI 标题生成。
- AI 摘要生成。
- AI 小红书文案改写。
- AI 热点发现。
- AI 创作灵感。
- AI SEO / GEO 优化。
- AI 多平台风格转换。
- AI 内容数据分析。

#### 长期

- 发布视频到微信视频号。
- 发布视频到抖音。
- 发布视频到快手。
- 发布视频到 YouTube。
- 发布视频到 B 站。
- 视频拆解和脚本提取。
- 爆款内容结构分析。
- 视频脚本生成。
- 多平台发布后数据追踪。
- 内容资产库。
- 创作日历。
- 团队协作。

### 开源边界

可以开源：

- Publisher Core。
- 平台适配器。
- 管理 UI 组件。
- API 路由结构。
- 文档和部署示例。

生产环境应保持私有：

- 真实 `WENYAN_API_KEY`。
- 微信 App 凭据。
- 真实发布记录。
- 私有模板。
- 商业内容工作流。

### License

Apache-2.0. See [LICENSE](./LICENSE).

### Acknowledgements

- [Wenyan](https://github.com/caol64/wenyan)
- [Wenyan MCP](https://github.com/caol64/wenyan-mcp)

---

## English

XBSTACK Publisher is an open-source Markdown-first publishing workspace for creators, indie hackers, and technical writers. It helps you import, edit, manage images, set covers, export content for multiple platforms, and publish Markdown articles to WeChat Official Account drafts through Wenyan Server.

Current focus:

```text
Markdown article -> WeChat Official Account draft
Markdown article -> copy-ready exports for Zhihu / Juejin / Xiaohongshu / personal websites
```

### Version

```text
v0.1.0-alpha
```

This is an alpha release. The app can run as a standalone Astro app. WeChat draft publishing is supported through Wenyan Server. Zhihu, Juejin, and Xiaohongshu currently use copy-ready exports.

### Features

#### Content Sources

- Paste Markdown manually.
- Import a browser-selected folder with `.md` / `.mdx` files and images.
- Build an article queue for batch processing.
- Edit a publishing copy without overwriting the original article.

#### Markdown Editing

- Markdown-first editing workflow.
- Front Matter parsing.
- Title, author, cover, slug, and source URL detection.
- Title fallback from the first `# H1` heading.
- Platform preview and export generation.

#### Image Workflow

Implemented:

- Upload images into the local publishing asset library.
- Insert uploaded images into Markdown.
- Select images from the asset library.
- Set an image as the article cover.
- Use the first body image as the cover.
- Preserve image references for preflight checks.

Planned:

- Paste image files directly from the clipboard.
- Auto-upload pasted images into the asset library.
- Insert pasted images as `![alt](url)`.
- Paste image URLs and show inline previews.
- Insert pasted image URLs into the body.
- Set pasted image URLs as covers.
- Download and rehost remote image URLs.
- Drag and drop image uploads.
- Batch-manage imported or pasted images.

#### WeChat Official Account Publishing

- Publish Markdown articles to WeChat Official Account drafts through Wenyan Server.
- Keep WeChat credentials server-side.
- Use the same Wenyan Server for local preview, NAS deployment, and server deployment.
- Track publishing job status and errors.

#### Multi-Platform Export

| Platform | Current capability |
| --- | --- |
| WeChat Official Account | Publish to draft box through Wenyan Server |
| Zhihu | Copy-ready Markdown / rich-text oriented export |
| Juejin | Copy-ready Markdown export |
| Xiaohongshu | Copy-ready title, body, topics, and image list |
| Personal website | Markdown/MDX publishing copy |

### Hardware and System Requirements

#### Minimum

| Item | Requirement |
| --- | --- |
| CPU | 1 core |
| Memory | 512 MB available RAM |
| Disk | 300 MB, excluding uploaded images |
| Node.js | 18 or later |
| Package manager | pnpm 9 or later, pnpm 10 recommended |
| OS | macOS, Linux, Windows, or NAS Linux environments |

#### Recommended

| Scenario | Recommended setup |
| --- | --- |
| Local development | 2 CPU cores, 2 GB RAM |
| Home NAS | 2 CPU cores, 2 GB RAM, persistent storage |
| Public server | 2 CPU cores, 4 GB RAM, HTTPS, reverse proxy |
| Heavy image usage | Dedicated image storage directory or object storage |

#### Browser

- Modern Chrome, Edge, Safari, or Firefox.
- Folder import works best in Chromium-based browsers.

### Architecture

```text
Browser UI
  -> Publisher API
    -> Publisher Core
      -> Platform Adapters
        -> Wenyan Server
        -> Copy-ready exporters
```

Main directories:

```text
src/features/publisher/components   # React publishing workspace
src/features/publisher/core         # Markdown parsing, config, storage, shared types
src/features/publisher/adapters     # Wenyan and export adapters
src/pages/api/publisher             # Preview, import, assets, jobs, publish APIs
```

Security model:

- The browser never reads `WECHAT_APP_SECRET`.
- The browser never reads `WENYAN_API_KEY`.
- WeChat publishing runs server-side.
- Wenyan Server creates the actual WeChat drafts.

### Local Deployment

#### 1. Clone

```bash
git clone git@github.com:xbstack/xbstack-publisher.git
cd xbstack-publisher
```

Or use HTTPS:

```bash
git clone https://github.com/xbstack/xbstack-publisher.git
cd xbstack-publisher
```

#### 2. Install dependencies

```bash
pnpm install
```

#### 3. Create `.env`

```bash
cp .env.example .env
```

You can keep the placeholder values for a local-only trial. WeChat publishing will be unavailable until Wenyan Server is configured, but editing, importing, image upload, and copy exports will work.

#### 4. Start development server

```bash
pnpm dev
```

Open:

```text
http://localhost:4321/admin/publisher/
```

#### 5. Production build

```bash
pnpm build
pnpm preview
```

### NAS / Server Deployment

Recommended topology:

```text
Browser
  -> XBSTACK Publisher
    -> Wenyan Server
      -> WeChat Official Account API
```

Benefits:

- Your local computer does not need to be added to the WeChat IP whitelist.
- Only the NAS or server IP needs to be whitelisted.
- WeChat credentials stay on the server side.
- Multiple devices can use the same browser-based publishing workspace.

Production recommendations:

- Build with `pnpm build`.
- Run with a Node process manager, Docker, systemd, or NAS service manager.
- Put HTTPS in front with Nginx, Caddy, Cloudflare Tunnel, or a NAS reverse proxy.
- Persist `data/publisher` and `public/assets/uploads`.
- Never commit `.env` to Git.

### Environment Variables

```env
PUBLISHER_MODE=server
WENYAN_SERVER_URL=https://your-wenyan-server
WENYAN_API_KEY=your-api-key
WENYAN_PUBLISH_PATH=/api/publish
PUBLISHER_STORAGE_PATH=data/publisher/jobs.json
PUBLISHER_ASSET_DIR=public/assets/uploads
PUBLISHER_PUBLIC_ASSET_BASE_URL=
```

| Variable | Description |
| --- | --- |
| `PUBLISHER_MODE` | Defaults to `server` |
| `WENYAN_SERVER_URL` | Wenyan Server URL |
| `WENYAN_API_KEY` | Server-side key for Wenyan Server |
| `WENYAN_PUBLISH_PATH` | Wenyan publish endpoint path, defaults to `/api/publish` |
| `PUBLISHER_STORAGE_PATH` | JSON storage path for publishing jobs |
| `PUBLISHER_ASSET_DIR` | Image upload directory |
| `PUBLISHER_PUBLIC_ASSET_BASE_URL` | Optional public image base URL |

Future local fallback variables:

```env
WENYAN_LOCAL_ENABLED=false
WECHAT_APP_ID=your-app-id
WECHAT_APP_SECRET=your-app-secret
```

### WeChat Publishing Setup

To publish to WeChat Official Account drafts, you need:

1. A configured WeChat Official Account.
2. A valid `WECHAT_APP_ID` and `WECHAT_APP_SECRET`.
3. A reachable Wenyan Server.
4. The public IP of Wenyan Server added to the WeChat Official Account IP whitelist.
5. These Publisher variables configured:

```env
WENYAN_SERVER_URL=https://your-wenyan-server
WENYAN_API_KEY=your-api-key
WENYAN_PUBLISH_PATH=/api/publish
```

Notes:

- XBSTACK Publisher creates draft-box articles only. It does not mass-send articles.
- If Wenyan Server cannot access image URLs, deploy Publisher and Wenyan Server on the same machine or configure `PUBLISHER_PUBLIC_ASSET_BASE_URL`.
- Do not expose WeChat credentials in frontend code or GitHub.

### Usage Guide

#### Paste Markdown manually

1. Open `/admin/publisher/`.
2. Choose the paste/manual source.
3. Paste Markdown into the editor.
4. Run preflight checks.
5. Select target platforms.
6. Publish or export.

#### Batch import a folder

1. Prepare a local folder with `.md` / `.mdx` files and images.
2. Open the import tab.
3. Click folder import.
4. The app uploads images, parses articles, and builds a queue.
5. Review each title, cover, and image status.
6. Publish or export in batch.

#### Upload and insert images

1. Click upload and insert.
2. Select a local image.
3. The image is stored in `public/assets/uploads`.
4. Markdown image syntax is inserted into the editor.

#### Set a cover

You can:

- upload an image and use it as cover;
- select an asset-library image as cover;
- set the first body image as cover.

#### Publish to WeChat draft box

1. Configure Wenyan Server in `.env`.
2. Select WeChat Official Account.
3. Click publish.
4. Check the draft in the WeChat Official Account backend.

#### Export to other platforms

1. Select Zhihu, Juejin, Xiaohongshu, or personal website.
2. Publish/export.
3. Copy the generated platform output.
4. Paste it into the target platform editor.

### Commands

```bash
pnpm dev       # local development
pnpm build     # production build
pnpm preview   # preview built app
pnpm check     # Astro / TypeScript checks
```

### Current Limitations

- WeChat publishing depends on Wenyan Server.
- Zhihu, Juejin, and Xiaohongshu are copy-export only.
- Publishing jobs are stored in local JSON.
- Clipboard image paste, remote image rehosting, and drag-and-drop upload are not implemented yet.
- Video publishing and AI workflows are not implemented yet.

### Roadmap

#### Short Term

- Docker Compose deployment.
- Single-user mode.
- Direct clipboard image paste.
- Auto-upload pasted images.
- Image URL paste with preview.
- Remote image download and rehosting.
- Drag-and-drop image upload.
- Better WeChat preview.
- Theme/template system.
- Database-backed publishing jobs.

#### Mid Term

- AI polishing and rewriting.
- AI dynamic layout suggestions.
- AI title generation.
- AI summary generation.
- AI Xiaohongshu rewriting.
- AI trend discovery.
- AI creative inspiration.
- AI SEO / GEO optimization.
- AI multi-platform style conversion.
- AI content analytics.

#### Long Term

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

### Open Source Boundary

Safe to open source:

- Publisher Core.
- Platform adapters.
- Admin UI components.
- API route shapes.
- Documentation and deployment examples.

Keep private in production:

- Real `WENYAN_API_KEY`.
- WeChat app credentials.
- Real publishing history.
- Private templates.
- Commercial content workflows.

### License

Apache-2.0. See [LICENSE](./LICENSE).

### Acknowledgements

- [Wenyan](https://github.com/caol64/wenyan)
- [Wenyan MCP](https://github.com/caol64/wenyan-mcp)
