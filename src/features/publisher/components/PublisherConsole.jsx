import React, { useEffect, useRef, useState } from "react";

const PLATFORMS = [
  { id: "wechat", label: "微信公众号", hint: "真实草稿箱" },
  { id: "zhihu", label: "知乎", hint: "复制导出" },
  { id: "juejin", label: "掘金", hint: "Markdown" },
  { id: "xiaohongshu", label: "小红书", hint: "文案+话题" },
  { id: "xbstack", label: "XBSTACK", hint: "站内副本" },
];

const DEFAULT_MARKDOWN = `---
title: XBSTACK Publisher 测试文章
author: 小白
cover:
---

# XBSTACK Publisher 测试文章

这里是一篇用于发布到微信公众号草稿箱的 Markdown。

## 核心要点

- 支持公众号草稿箱
- 支持多平台导出
- 支持图片插入与封面设置
`;

export default function PublisherConsole() {
  const [sourceTab, setSourceTab] = useState("library");
  const [articles, setArticles] = useState([]);
  const [queue, setQueue] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [preview, setPreview] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [assets, setAssets] = useState([]);
  const [status, setStatus] = useState(null);
  const [platforms, setPlatforms] = useState(["wechat", "zhihu", "juejin", "xiaohongshu"]);
  const [theme, setTheme] = useState("default");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const editorRef = useRef(null);
  const uploadRef = useRef(null);
  const folderRef = useRef(null);

  useEffect(() => {
    refreshArticles();
    refreshJobs();
    refreshAssets();
    refreshStatus();
  }, []);

  useEffect(() => {
    if (queue[activeIndex]) {
      setMarkdown(queue[activeIndex].markdown);
      setPreview(queue[activeIndex].preview || null);
    }
  }, [activeIndex, queue]);

  const activeArticle = preview?.article;
  const firstImage = activeArticle?.images?.[0]?.resolvedSrc || activeArticle?.images?.[0]?.src;

  async function refreshArticles() {
    const res = await fetch("/api/publisher/articles/");
    const data = await res.json();
    if (data.success) setArticles(data.data || []);
  }

  async function refreshJobs() {
    const res = await fetch("/api/publisher/jobs/");
    const data = await res.json();
    if (data.success) setJobs(data.data || []);
  }

  async function refreshAssets() {
    const res = await fetch("/api/publisher/assets/");
    const data = await res.json();
    if (data.success) setAssets(data.data || []);
  }

  async function refreshStatus() {
    const res = await fetch("/api/publisher/status/");
    const data = await res.json();
    if (data.success) setStatus(data.data);
  }

  async function loadArticle(item) {
    setBusy(true);
    try {
      const res = await fetch(`/api/publisher/articles/?collection=${encodeURIComponent(item.collection)}&id=${encodeURIComponent(item.id)}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "读取失败");
      setMarkdown(data.data.markdown);
      setQueue([{ id: data.data.id, title: data.data.title, markdown: data.data.markdown, preview: { article: data.data, checks: [], exports: {} } }]);
      setActiveIndex(0);
      setMessage(`已载入：${data.data.title}`);
      await runPreview(data.data.markdown);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function runPreview(value = markdown) {
    setBusy(true);
    try {
      const res = await fetch("/api/publisher/preview/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: value, platforms }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "预检查失败");
      setPreview(data.data);
      patchActiveQueue({ markdown: value, preview: data.data, title: data.data.article.title });
      setMessage("预检查完成");
      return data.data;
    } catch (error) {
      setMessage(error.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function createAndPublish(selectedOnly = false) {
    const targets = selectedOnly && queue.length ? queue : [{ markdown, title: activeArticle?.title || "手动文章" }];
    setBusy(true);
    try {
      for (const item of targets) {
        const prepared = item.preview || await runPreview(item.markdown);
        const res = await fetch("/api/publisher/jobs/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ article: prepared?.article, markdown: item.markdown, platforms, theme }),
        });
        const created = await res.json();
        if (!created.success) throw new Error(created.error || "创建任务失败");
        const pub = await fetch(`/api/publisher/jobs/${created.data.id}/publish/`, { method: "POST" });
        const published = await pub.json();
        if (!published.success) setMessage(published.error || "部分平台发布失败");
      }
      await refreshJobs();
      setMessage("发布/导出任务已执行");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleFolder(files) {
    const fileList = Array.from(files || []);
    if (!fileList.length) return;
    setBusy(true);
    try {
      const imageFiles = fileList.filter((file) => file.type.startsWith("image/"));
      const uploadedAssets = [];
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch("/api/publisher/assets/", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) {
          uploadedAssets.push({
            name: file.name,
            path: file.webkitRelativePath || file.name,
            url: data.data.url,
          });
        }
      }

      const markdownFiles = await Promise.all(
        fileList
          .filter((file) => /\.(md|mdx)$/i.test(file.name))
          .map(async (file) => ({
            name: file.name,
            path: file.webkitRelativePath || file.name,
            content: await file.text(),
          }))
      );

      const res = await fetch("/api/publisher/import-folder/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: markdownFiles, assets: uploadedAssets }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "导入失败");
      const imported = (data.data.articles || []).map((item, index) => ({
        id: item.article.id || `import-${index}`,
        title: item.article.title,
        markdown: item.article.markdown,
        preview: item,
      }));
      setQueue(imported);
      setActiveIndex(0);
      setPreview(imported[0]?.preview || null);
      setMarkdown(imported[0]?.markdown || DEFAULT_MARKDOWN);
      await refreshAssets();
      setMessage(`导入 ${imported.length} 篇文章，上传 ${uploadedAssets.length} 张图片`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
      if (folderRef.current) folderRef.current.value = "";
    }
  }

  async function uploadImage(file, setAsCover = false) {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setBusy(true);
    try {
      const res = await fetch("/api/publisher/assets/", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "上传失败");
      if (setAsCover) setCover(data.data.url);
      else insertImage(data.data.url, file.name.replace(/\.[^.]+$/, ""));
      await refreshAssets();
      setMessage("图片已入库");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
      if (uploadRef.current) uploadRef.current.value = "";
    }
  }

  function insertImage(url, alt = "图片描述") {
    const textarea = editorRef.current;
    const snippet = `\n![${alt}](${url})\n`;
    if (!textarea) {
      setMarkdown((prev) => `${prev}${snippet}`);
      return;
    }
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const next = `${markdown.slice(0, start)}${snippet}${markdown.slice(end)}`;
    setMarkdown(next);
    setTimeout(() => textarea.focus(), 0);
  }

  function setCover(url) {
    const next = upsertFrontmatterField(markdown, "cover", url);
    setMarkdown(next);
    runPreview(next);
  }

  function togglePlatform(platform) {
    setPlatforms((current) => current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]);
  }

  function patchActiveQueue(patch) {
    setQueue((current) => current.map((item, index) => index === activeIndex ? { ...item, ...patch } : item));
  }

  const exportTabs = preview?.exports ? Object.values(preview.exports) : [];

  return (
    <div className="publisher-console space-y-8">
      <section className="grid grid-cols-1 2xl:grid-cols-[310px_1fr_360px] gap-6">
        <aside className="rounded-2xl bg-slate-900 border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-sm font-black tracking-widest uppercase">文章来源</h2>
              <span className={`text-[10px] font-black ${status?.wenyanConfigured ? "text-emerald-400" : "text-amber-400"}`}>
                {status?.wenyanConfigured ? "WENYAN READY" : "WENYAN MISSING"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Server: {status?.wenyanServerUrl || "未配置"}</p>
          </div>

          <div className="grid grid-cols-3 border-b border-white/10">
            {["library", "manual", "folder"].map((tab) => (
              <button key={tab} onClick={() => setSourceTab(tab)} className={`py-3 text-[10px] font-black uppercase ${sourceTab === tab ? "bg-orange-600 text-white" : "bg-slate-950 text-slate-400"}`}>
                {tab === "library" ? "文章库" : tab === "manual" ? "粘贴" : "导入"}
              </button>
            ))}
          </div>

          <div className="p-4 max-h-[680px] overflow-y-auto">
            {sourceTab === "library" && (
              <div className="space-y-2">
                {articles.slice(0, 120).map((item) => (
                  <button key={`${item.collection}/${item.id}`} onClick={() => loadArticle(item)} className="w-full text-left p-3 rounded-xl bg-black/40 hover:bg-slate-800 border border-white/5">
                    <div className="text-xs font-black text-white line-clamp-2">{item.title}</div>
                    <div className="mt-1 text-[10px] text-slate-500">{item.collection}/{item.id}</div>
                  </button>
                ))}
              </div>
            )}

            {sourceTab === "manual" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">直接在中间编辑器粘贴 Markdown，点击预检查后创建发布任务。</p>
                <button onClick={() => { setQueue([]); setMarkdown(DEFAULT_MARKDOWN); setPreview(null); }} className="w-full py-3 rounded-xl bg-slate-800 text-white text-xs font-black">载入示例</button>
              </div>
            )}

            {sourceTab === "folder" && (
              <div className="space-y-4">
                <input ref={folderRef} type="file" multiple webkitdirectory="" directory="" className="hidden" onChange={(event) => handleFolder(event.target.files)} />
                <button onClick={() => folderRef.current?.click()} className="w-full py-4 rounded-xl bg-sky-600 text-white text-xs font-black">选择文件夹导入</button>
                <div className="space-y-2">
                  {queue.map((item, index) => (
                    <button key={`${item.id}-${index}`} onClick={() => setActiveIndex(index)} className={`w-full text-left p-3 rounded-xl border ${activeIndex === index ? "bg-orange-600/20 border-orange-500" : "bg-black/30 border-white/5"}`}>
                      <div className="text-xs font-black text-white line-clamp-2">{item.title}</div>
                      <div className="mt-1 text-[10px] text-slate-400">{item.preview?.article?.images?.length || 0} images</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="rounded-2xl bg-slate-900 border border-white/10 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-white/10 bg-black/30">
            <div>
              <h2 className="text-white text-sm font-black">{activeArticle?.title || "发布副本编辑器"}</h2>
              <p className="text-[10px] text-slate-500 mt-1">发布前编辑不会覆盖站内原文</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => uploadRef.current?.click()} className="px-4 py-2 rounded-lg bg-slate-800 text-white text-[10px] font-black">上传并插入图片</button>
              <button onClick={() => firstImage && setCover(firstImage)} disabled={!firstImage} className="px-4 py-2 rounded-lg bg-slate-800 text-white text-[10px] font-black disabled:opacity-40">首图设封面</button>
              <button onClick={() => runPreview()} className="px-4 py-2 rounded-lg bg-sky-600 text-white text-[10px] font-black">预检查</button>
            </div>
            <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={(event) => uploadImage(event.target.files?.[0])} />
          </div>

          <textarea
            ref={editorRef}
            value={markdown}
            onChange={(event) => setMarkdown(event.target.value)}
            className="w-full h-[690px] resize-none bg-slate-950 text-slate-100 p-6 text-sm leading-7 font-mono outline-none"
            spellCheck="false"
          />
        </main>

        <aside className="space-y-5">
          <Panel title="元信息">
            <Meta label="标题" value={activeArticle?.title} />
            <Meta label="集合" value={activeArticle?.collection || activeArticle?.source || "manual"} />
            <Meta label="作者" value={activeArticle?.author || "未设置"} />
            <Meta label="图片" value={`${activeArticle?.images?.length || 0} 张`} />
          </Panel>

          <Panel title="封面">
            {activeArticle?.cover ? <img src={activeArticle.cover} alt="cover" className="w-full h-40 object-cover rounded-xl border border-white/10" /> : <div className="h-40 rounded-xl bg-black/40 border border-dashed border-white/10 grid place-items-center text-xs text-slate-500">未设置封面</div>}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button onClick={() => uploadRef.current?.click()} className="py-2 rounded-lg bg-slate-800 text-white text-[10px] font-black">上传图片</button>
              <button onClick={() => setCover("")} className="py-2 rounded-lg bg-slate-800 text-white text-[10px] font-black">清除封面</button>
            </div>
          </Panel>

          <Panel title="平台与发布">
            <div className="space-y-2">
              {PLATFORMS.map((platform) => (
                <label key={platform.id} className="flex items-center justify-between gap-3 rounded-xl bg-black/30 border border-white/5 p-3 cursor-pointer">
                  <span>
                    <span className="block text-xs font-black text-white">{platform.label}</span>
                    <span className="text-[10px] text-slate-500">{platform.hint}</span>
                  </span>
                  <input type="checkbox" checked={platforms.includes(platform.id)} onChange={() => togglePlatform(platform.id)} />
                </label>
              ))}
            </div>
            <select value={theme} onChange={(event) => setTheme(event.target.value)} className="mt-4 w-full bg-black border border-white/10 rounded-xl px-3 py-3 text-xs text-white">
              <option value="default">default theme</option>
              <option value="orange">orange theme</option>
              <option value="clean">clean theme</option>
            </select>
            <button disabled={busy || platforms.length === 0} onClick={() => createAndPublish(queue.length > 1)} className="mt-4 w-full py-4 rounded-xl bg-emerald-600 text-white text-xs font-black tracking-widest disabled:opacity-50">
              {busy ? "处理中..." : queue.length > 1 ? "批量发布/导出" : "发布到草稿箱/导出"}
            </button>
            {message && <p className="mt-3 text-xs text-amber-300">{message}</p>}
          </Panel>

          <Panel title="预检查">
            <div className="space-y-2">
              {(preview?.checks || []).map((check) => (
                <div key={check.key} className="rounded-lg bg-black/30 p-3 border border-white/5">
                  <div className={`text-[10px] font-black uppercase ${check.level === "ok" ? "text-emerald-400" : check.level === "warning" ? "text-amber-400" : "text-red-400"}`}>{check.label}</div>
                  <div className="text-xs text-slate-300 mt-1">{check.message}</div>
                </div>
              ))}
            </div>
          </Panel>
        </aside>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Panel title="多平台导出预览">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exportTabs.map((item) => (
              <div key={item.platform} className="rounded-xl bg-black/30 border border-white/5 p-4">
                <div className="flex justify-between items-center mb-2">
                  <strong className="text-xs text-white uppercase">{item.platform}</strong>
                  <button onClick={() => navigator.clipboard?.writeText(item.content)} className="text-[10px] text-sky-400 font-black">复制</button>
                </div>
                <pre className="text-[11px] text-slate-400 whitespace-pre-wrap max-h-40 overflow-auto">{item.content}</pre>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="发布任务历史">
          <div className="space-y-3 max-h-[420px] overflow-auto">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-xl bg-black/30 border border-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-black text-white">{job.title}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{job.platforms?.join(", ")} · {new Date(job.createdAt).toLocaleString()}</div>
                  </div>
                  <span className={`text-[10px] font-black ${job.status === "failed" ? "text-red-400" : job.status === "draft_created" ? "text-emerald-400" : "text-sky-400"}`}>{job.status}</span>
                </div>
                {job.error && <div className="mt-2 text-xs text-red-300">{job.error}</div>}
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <Panel title="图片库">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {assets.map((asset) => (
            <div key={asset.url} className="rounded-xl overflow-hidden bg-black/30 border border-white/5">
              <img src={asset.url} alt={asset.name} className="w-full aspect-square object-cover" />
              <div className="grid grid-cols-2">
                <button onClick={() => insertImage(asset.url, asset.name)} className="py-2 text-[10px] text-sky-300 font-black">插入</button>
                <button onClick={() => setCover(asset.url)} className="py-2 text-[10px] text-orange-300 font-black">封面</button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-2xl bg-slate-900 border border-white/10 p-5">
      <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="flex justify-between gap-3 py-2 border-b border-white/5 last:border-b-0">
      <span className="text-[10px] text-slate-500 font-black uppercase">{label}</span>
      <span className="text-xs text-slate-200 text-right break-all">{value || "-"}</span>
    </div>
  );
}

function upsertFrontmatterField(markdown, key, value) {
  if (/^---\n/.test(markdown)) {
    const end = markdown.indexOf("\n---", 4);
    if (end > 0) {
      const head = markdown.slice(4, end);
      const body = markdown.slice(end);
      const line = `${key}: ${value || ""}`;
      const pattern = new RegExp(`^${key}:.*$`, "m");
      const nextHead = pattern.test(head) ? head.replace(pattern, line) : `${head.trimEnd()}\n${line}\n`;
      return `---\n${nextHead}${body}`;
    }
  }
  return `---\n${key}: ${value || ""}\n---\n\n${markdown}`;
}
