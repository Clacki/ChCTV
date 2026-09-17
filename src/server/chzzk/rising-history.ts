import "server-only";

import { Redis } from "@upstash/redis";

import { getRisingIncrease, getRisingSortValue, RISING_CONFIG, type Snapshot } from "../../lib/rising-broadcasts";
import type { ParticipantBroadcast } from "../../types/participant-broadcast";

const redisKey = "chctv:rising:snapshots";
const minimumSampleGapMs = 4 * 60 * 1000;

export type RedisSnapshot = { timestamp: number; viewers: Record<string, number> };
export type ServerRisingResult = { channelId: string; isRising: boolean; increase: number | null; rate: number | null; sortValue: number | null };
export type ServerRisingHistory = { ready: boolean; results: ServerRisingResult[] };
type RisingRedis = Pick<Redis, "get" | "set">;

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

export async function recordRisingHistory(broadcasts: readonly ParticipantBroadcast[], timestamp = Date.now()): Promise<ServerRisingHistory | null> {
  const redis = getRedis();
  if (!redis) return null;

  return recordRisingHistoryWithRedis(redis, broadcasts, timestamp);
}

export async function recordRisingHistoryWithRedis(
  redis: RisingRedis,
  broadcasts: readonly ParticipantBroadcast[],
  timestamp: number,
): Promise<ServerRisingHistory | null> {
  try {
    const stored = (await redis.get<RedisSnapshot[]>(redisKey)) ?? [];
    const next = appendRisingSnapshot(stored, broadcasts, timestamp);
    if (next.didAppend) await redis.set(redisKey, next.snapshots);
    return createServerRisingHistory(next.snapshots);
  } catch {
    console.warn("[chzzk] rising history unavailable");
    return null;
  }
}

export function appendRisingSnapshot(
  stored: readonly RedisSnapshot[],
  broadcasts: readonly ParticipantBroadcast[],
  timestamp: number,
): { snapshots: RedisSnapshot[]; didAppend: boolean } {
  const latest = stored.at(-1);
  if (latest && timestamp - latest.timestamp < minimumSampleGapMs) {
    return { snapshots: [...stored], didAppend: false };
  }

  const viewers = Object.fromEntries(
    broadcasts.flatMap((broadcast) => broadcast.isLive && broadcast.live
      ? [[broadcast.live.channelId, broadcast.live.viewerCount]]
      : []),
  );
  const snapshots = latest && timestamp - latest.timestamp > RISING_CONFIG.resetMs
    ? [{ timestamp, viewers }]
    : [...stored, { timestamp, viewers }].slice(-3);

  return { snapshots, didAppend: true };
}

export function createServerRisingHistory(snapshots: readonly RedisSnapshot[]): ServerRisingHistory {
  return { ready: snapshots.length >= 2, results: calculateServerRising(snapshots) };
}

export function applyServerRisingMetadata(
  broadcasts: readonly ParticipantBroadcast[],
  results: readonly ServerRisingResult[] | null,
): ParticipantBroadcast[] {
  const resultsByChannelId = new Map(results?.map((result) => [result.channelId, result]));

  return broadcasts.map((broadcast) => {
    const rising = broadcast.live ? resultsByChannelId.get(broadcast.live.channelId) : undefined;
    return {
      ...broadcast,
      isRising: rising?.isRising ?? false,
      risingIncrease: rising?.increase ?? null,
      risingRate: rising?.rate ?? null,
      risingSortValue: rising?.sortValue ?? null,
    };
  });
}

export function calculateServerRising(snapshots: readonly RedisSnapshot[]): ServerRisingResult[] {
  const channelIds = new Set(snapshots.flatMap((snapshot) => Object.keys(snapshot.viewers)));
  return [...channelIds].map((channelId) => {
    const history: Snapshot[] = [];
    for (const snapshot of [...snapshots].reverse()) {
      if (snapshot.viewers[channelId] === undefined) break;
      history.unshift({ timestamp: snapshot.timestamp, viewerCount: snapshot.viewers[channelId] });
    }
    const increase = getRisingIncrease(history);
    const sortValue = increase === null ? null : getRisingSortValue(history);
    const latest = history.at(-1)?.viewerCount ?? 0;
    const previous = history.at(-2)?.viewerCount ?? 0;
    return { channelId, isRising: increase !== null, increase, rate: previous ? (latest - previous) / previous : null, sortValue };
  }).sort((left, right) => (right.sortValue ?? 0) - (left.sortValue ?? 0));
}
