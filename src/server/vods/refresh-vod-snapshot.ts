import "server-only";

import { getParticipantVods } from "@/server/chzzk/participant-vods";
import { createVodRefreshPlan, getVodRefreshBatch } from "@/server/vods/vod-refresh-plan";
import type { Participant } from "@/types/participant";
import type { VodSnapshot } from "@/types/vod-snapshot";

import { readVodSnapshot, writeVodSnapshot } from "./vod-snapshot-store";

const refreshingByBatch = new Map<number, Promise<VodSnapshot>>();

async function refresh(batchIndex: number, participants?: readonly Participant[]): Promise<VodSnapshot> {
  const startedAt = Date.now();
  const plan = createVodRefreshPlan(participants);
  const batchChannelIds = getVodRefreshBatch(plan, batchIndex);
  const activeChannelIds = new Set(plan.channelIds);
  const batchChannelIdSet = new Set(batchChannelIds);
  let previous: VodSnapshot | null;

  console.info("[VOD refresh] snapshot read started", { batchIndex });
  try {
    previous = await readVodSnapshot();
  } catch (error) {
    console.error("[VOD refresh] snapshot read failed", { batchIndex, error });
    throw error;
  }

  const existingVods = previous?.vods.filter((vod) => activeChannelIds.has(vod.channelId)) ?? [];
  console.info("[VOD refresh] participant VOD collection started", { batchIndex, attemptedChannelCount: batchChannelIds.length });
  const result = await getParticipantVods({ channelIds: batchChannelIds, existingVods }, participants);
  console.info("[VOD refresh] participant VOD collection completed", {
    batchIndex,
    attemptedChannelCount: result.attemptedChannelCount,
    failureCount: result.failures.length,
    vodCount: result.vods.length,
  });

  if (result.attemptedChannelCount > 0 && result.failures.length === result.attemptedChannelCount) {
    console.error("[VOD refresh] every channel failed", {
      batchIndex,
      channelIds: batchChannelIds,
      attemptedChannelCount: result.attemptedChannelCount,
      failures: result.failures.map(({ channelId, kind, status }) => ({ channelId, kind, ...(status === undefined ? {} : { status }) })),
    });
    throw new Error("VOD collection failed for every channel in the batch");
  }
  const completedAt = Date.now();
  const retainedFailures = previous?.failures.filter((failure) => activeChannelIds.has(failure.channelId) && !batchChannelIdSet.has(failure.channelId)) ?? [];
  const snapshot: VodSnapshot = {
    version: 1,
    refreshedAt: completedAt,
    vods: result.vods,
    failures: [...retainedFailures, ...result.failures],
    startedAt,
    completedAt,
  };
  console.info("[VOD refresh] snapshot write started", { batchIndex, vodCount: snapshot.vods.length, failureCount: snapshot.failures.length });
  try {
    await writeVodSnapshot(snapshot);
  } catch (error) {
    console.error("[VOD refresh] snapshot write failed", { batchIndex, error });
    throw error;
  }

  return snapshot;
}

export function refreshVodSnapshot(batchIndex: number, participants?: readonly Participant[]): Promise<VodSnapshot> {
  const refreshing = refreshingByBatch.get(batchIndex);
  if (refreshing) return refreshing;

  const next = refresh(batchIndex, participants).finally(() => { refreshingByBatch.delete(batchIndex); });
  refreshingByBatch.set(batchIndex, next);
  return next;
}
