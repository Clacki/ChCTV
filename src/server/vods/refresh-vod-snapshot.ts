import "server-only";

import { getParticipantVods } from "@/server/chzzk/participant-vods";
import type { VodSnapshot } from "@/types/vod-snapshot";

import { readVodSnapshot, writeVodSnapshot } from "./vod-snapshot-store";

let refreshing: Promise<VodSnapshot> | null = null;

async function refresh(): Promise<VodSnapshot> {
  const startedAt = Date.now();
  const previous = await readVodSnapshot();
  const result = await getParticipantVods({ existingVods: previous?.vods ?? [] });
  if (result.attemptedChannelCount > 0 && result.failures.length === result.attemptedChannelCount) {
    throw new Error("VOD collection failed for every channel");
  }
  const completedAt = Date.now();
  const snapshot: VodSnapshot = { version: 1, refreshedAt: completedAt, vods: result.vods, failures: result.failures, startedAt, completedAt };
  await writeVodSnapshot(snapshot);
  return snapshot;
}

export function refreshVodSnapshot(): Promise<VodSnapshot> {
  if (!refreshing) refreshing = refresh().finally(() => { refreshing = null; });
  return refreshing;
}
