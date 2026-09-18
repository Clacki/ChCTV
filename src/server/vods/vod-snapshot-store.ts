import "server-only";

import { Redis } from "@upstash/redis";

import type { VodSnapshot } from "@/types/vod-snapshot";

export const VOD_SNAPSHOT_KEY = "chctv:vod:bongnudo:snapshot";
type VodSnapshotRedis = Pick<Redis, "get" | "set">;

export class VodSnapshotStoreConfigurationError extends Error {
  constructor() { super("Upstash Redis is not configured"); }
}

function getRedis(): VodSnapshotRedis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

function isSnapshot(value: unknown): value is VodSnapshot {
  if (typeof value !== "object" || value === null) return false;

  const snapshot = value as Record<string, unknown>;
  return snapshot.version === 1
    && typeof snapshot.refreshedAt === "number"
    && Number.isFinite(snapshot.refreshedAt)
    && Array.isArray(snapshot.vods)
    && Array.isArray(snapshot.failures)
    && typeof snapshot.startedAt === "number"
    && Number.isFinite(snapshot.startedAt)
    && typeof snapshot.completedAt === "number"
    && Number.isFinite(snapshot.completedAt);
}

export async function readVodSnapshot(): Promise<VodSnapshot | null> {
  const redis = getRedis();
  if (!redis) throw new VodSnapshotStoreConfigurationError();
  return readVodSnapshotWithRedis(redis);
}

export async function writeVodSnapshot(snapshot: VodSnapshot): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new VodSnapshotStoreConfigurationError();
  await writeVodSnapshotWithRedis(redis, snapshot);
}

export async function readVodSnapshotWithRedis(redis: VodSnapshotRedis): Promise<VodSnapshot | null> {
  const snapshot: unknown = await redis.get(VOD_SNAPSHOT_KEY);
  if (snapshot == null) return null;
  if (!isSnapshot(snapshot)) throw new Error("VOD snapshot is invalid");
  return snapshot;
}

export async function writeVodSnapshotWithRedis(redis: VodSnapshotRedis, snapshot: VodSnapshot): Promise<void> {
  await redis.set(VOD_SNAPSHOT_KEY, snapshot);
}
