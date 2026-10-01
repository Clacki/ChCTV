import "server-only";

import { getParticipants } from "@/lib/participants";
import { readVodSnapshot } from "@/server/vods/vod-snapshot-store";

import { createVodListResponse, type VodListResponse } from "./vod-read-model";

/** Reads the persisted VOD Snapshot only; it never contacts CHZZK or refreshes Redis. */
export async function readVods(): Promise<VodListResponse> {
  const snapshot = await readVodSnapshot();
  return createVodListResponse(snapshot?.vods ?? [], getParticipants());
}
