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
  const previous = await readVodSnapshot();
  const existingVods = previous?.vods.filter((vod) => activeChannelIds.has(vod.channelId)) ?? [];
  const result = await getParticipantVods({ channelIds: batchChannelIds, existingVods }, participants);
  if (result.attemptedChannelCount > 0 && result.failures.length === result.attemptedChannelCount) {
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
  await writeVodSnapshot(snapshot);
  return snapshot;
}

export function refreshVodSnapshot(batchIndex: number, participants?: readonly Participant[]): Promise<VodSnapshot> {
  const refreshing = refreshingByBatch.get(batchIndex);
  if (refreshing) return refreshing;

  const next = refresh(batchIndex, participants).finally(() => { refreshingByBatch.delete(batchIndex); });
  refreshingByBatch.set(batchIndex, next);
  return next;
}
