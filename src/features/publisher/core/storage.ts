import fs from "fs";
import path from "path";
import type { PublisherJob } from "./types";
import { getPublisherConfig } from "./config";

interface PublisherStore {
  jobs: PublisherJob[];
}

export function readPublisherJobs(): PublisherJob[] {
  const store = readStore();
  return store.jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getPublisherJob(id: string): PublisherJob | undefined {
  return readStore().jobs.find((job) => job.id === id);
}

export function createPublisherJob(input: Omit<PublisherJob, "id" | "createdAt" | "updatedAt" | "status" | "results">): PublisherJob {
  const now = new Date().toISOString();
  const job: PublisherJob = {
    ...input,
    id: `pub_${Date.now()}_${Math.round(Math.random() * 100000)}`,
    createdAt: now,
    updatedAt: now,
    status: "pending",
    results: {},
  };
  const store = readStore();
  store.jobs.unshift(job);
  writeStore(store);
  return job;
}

export function updatePublisherJob(id: string, updater: (job: PublisherJob) => PublisherJob): PublisherJob {
  const store = readStore();
  const index = store.jobs.findIndex((job) => job.id === id);
  if (index < 0) throw new Error(`Publisher job not found: ${id}`);
  const next = updater({ ...store.jobs[index], updatedAt: new Date().toISOString() });
  store.jobs[index] = next;
  writeStore(store);
  return next;
}

function readStore(): PublisherStore {
  const filePath = getPublisherConfig().storagePath;
  if (!fs.existsSync(filePath)) return { jobs: [] };
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return { jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [] };
  } catch {
    return { jobs: [] };
  }
}

function writeStore(store: PublisherStore) {
  const filePath = getPublisherConfig().storagePath;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
}
