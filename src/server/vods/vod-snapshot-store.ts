import "server-only";

import { get, put } from "@vercel/blob";

import type { VodSnapshot } from "@/types/vod-snapshot";

const pathname = "vods/bongnudo/latest.json";

export class VodSnapshotStoreConfigurationError extends Error {
  constructor() { super("Vercel Blob is not configured"); }
}

function requireBlobToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new VodSnapshotStoreConfigurationError();
}

function isSnapshot(value: unknown): value is VodSnapshot {
  return typeof value === "object" && value !== null && (value as { version?: unknown }).version === 1 && Array.isArray((value as { vods?: unknown }).vods) && Array.isArray((value as { failures?: unknown }).failures);
}

export async function readVodSnapshot(): Promise<VodSnapshot | null> {
  requireBlobToken();
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result) return null;
  const payload: unknown = await new Response(result.stream).json();
  if (!isSnapshot(payload)) throw new Error("VOD snapshot is invalid");
  return payload;
}

export async function writeVodSnapshot(snapshot: VodSnapshot): Promise<void> {
  requireBlobToken();
  await put(pathname, JSON.stringify(snapshot), { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" });
}
