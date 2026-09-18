import "server-only";

import { getParticipants } from "@/lib/participants";
import type { Participant } from "@/types/participant";

export const VOD_REFRESH_BATCH_SIZE = 10;

export type VodRefreshPlan = {
  batchSize: number;
  channelIds: readonly string[];
  channelCount: number;
  batchCount: number;
};

export class VodRefreshBatchError extends Error {
  constructor() { super("VOD refresh batch is invalid"); }
}

export function createVodRefreshPlan(
  participants: readonly Pick<Participant, "channelId">[] = getParticipants(),
): VodRefreshPlan {
  const channelIds = [...new Set(participants.flatMap((participant) => participant.channelId ? [participant.channelId] : []))];
  return {
    batchSize: VOD_REFRESH_BATCH_SIZE,
    channelIds,
    channelCount: channelIds.length,
    batchCount: Math.ceil(channelIds.length / VOD_REFRESH_BATCH_SIZE),
  };
}

export function getVodRefreshBatch(plan: VodRefreshPlan, batchIndex: number): readonly string[] {
  if (!Number.isInteger(batchIndex) || batchIndex < 0 || batchIndex >= plan.batchCount) throw new VodRefreshBatchError();
  return plan.channelIds.slice(batchIndex * plan.batchSize, (batchIndex + 1) * plan.batchSize);
}
