import "server-only";

import { unstable_cache } from "next/cache";

import { createParticipantBroadcastCache } from "../../lib/participant-broadcast-cache";
import { normalizeChzzkLiveThumbnailUrl } from "../../lib/chzzk-thumbnail-url";
import { getParticipants } from "../../lib/participants";
import type {
  CachedParticipantBroadcastsResult,
  ParticipantBroadcastSnapshot,
} from "../../types/participant-broadcast";
import { getParticipantBroadcasts } from "./participant-broadcasts";

export const CHZZK_LIVE_CACHE_SECONDS = 15 * 60;

function normalizeBroadcastThumbnails(broadcasts: ParticipantBroadcastSnapshot["broadcasts"]) {
  return broadcasts.map((broadcast) => {
    if (!broadcast.live) {
      return broadcast;
    }

    return {
      ...broadcast,
      live: {
        ...broadcast.live,
        thumbnailUrl: normalizeChzzkLiveThumbnailUrl(broadcast.live.thumbnailUrl),
      },
    };
  });
}

class BroadcastLoadError extends Error {
  constructor(
    readonly kind: Extract<CachedParticipantBroadcastsResult, { status: "error" }>["error"],
  ) {
    super("CHZZK broadcast discovery failed");
  }
}

const getCachedBroadcastSnapshot = unstable_cache(
  async (): Promise<ParticipantBroadcastSnapshot> => {
    const result = await getParticipantBroadcasts();

    if (result.status === "error") {
      throw new BroadcastLoadError(result.error);
    }

    return {
      broadcasts: result.broadcasts,
      ambiguousMatches: result.ambiguousMatches,
      fetchedAt: new Date().toISOString(),
    };
  },
  ["chzzk-participant-broadcasts"],
  { revalidate: CHZZK_LIVE_CACHE_SECONDS },
);

const getFromProcessCache = createParticipantBroadcastCache(
  getCachedBroadcastSnapshot,
  CHZZK_LIVE_CACHE_SECONDS,
);

export async function getCachedParticipantBroadcasts(): Promise<CachedParticipantBroadcastsResult> {
  const result = await getFromProcessCache();

  if (result.status === "error") {
    const error = result.cause instanceof BroadcastLoadError ? result.cause.kind : "upstream";
    return { status: "error", participants: getParticipants(), error };
  }

  return {
    status: result.status,
    broadcasts: normalizeBroadcastThumbnails(result.snapshot.broadcasts),
    ambiguousMatches: result.snapshot.ambiguousMatches,
    fetchedAt: result.snapshot.fetchedAt,
    cacheAgeSeconds: result.cacheAgeSeconds,
  };
}
