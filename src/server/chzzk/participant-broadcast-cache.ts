import "server-only";

import { unstable_cache } from "next/cache";

import { createParticipantBroadcastCache } from "../../lib/participant-broadcast-cache";
import { normalizeChzzkLiveThumbnailUrl } from "../../lib/chzzk-thumbnail-url";
import { refreshParticipantBroadcastMetadata } from "../../lib/participant-broadcasts";
import {
  ACTIVE_BROADCAST_REFRESH_SECONDS,
  getParticipantBroadcastRefreshPolicy,
  INACTIVE_BROADCAST_REFRESH_SECONDS,
} from "../../lib/participant-broadcast-refresh-policy";
import { getParticipants } from "../../lib/participants";
import type {
  CachedParticipantBroadcastsResult,
  ParticipantBroadcastSnapshot,
} from "../../types/participant-broadcast";
import { getParticipantBroadcasts } from "./participant-broadcasts";

export const CHZZK_LIVE_CACHE_SECONDS = INACTIVE_BROADCAST_REFRESH_SECONDS;

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

function createCachedBroadcastSnapshot(revalidate: number, key: string) {
  return unstable_cache(
  async (): Promise<ParticipantBroadcastSnapshot> => {
    console.info("[chzzk] LIVE cache miss; fetching upstream", { revalidate });
    const result = await getParticipantBroadcasts();

    if (result.status === "error") {
      throw new BroadcastLoadError(result.error);
    }

    return {
      broadcasts: result.broadcasts,
      ambiguousMatches: result.ambiguousMatches,
      risingHistoryReady: result.risingHistoryReady,
      fetchedAt: new Date().toISOString(),
    };
  },
  [key],
  { revalidate },
  );
}

const getActiveCachedBroadcastSnapshot = createCachedBroadcastSnapshot(
  ACTIVE_BROADCAST_REFRESH_SECONDS,
  "chzzk-participant-broadcasts-active",
);
const getInactiveCachedBroadcastSnapshot = createCachedBroadcastSnapshot(
  INACTIVE_BROADCAST_REFRESH_SECONDS,
  "chzzk-participant-broadcasts-inactive",
);

const getFromActiveProcessCache = createParticipantBroadcastCache(
  getActiveCachedBroadcastSnapshot,
  ACTIVE_BROADCAST_REFRESH_SECONDS,
);
const getFromInactiveProcessCache = createParticipantBroadcastCache(
  getInactiveCachedBroadcastSnapshot,
  INACTIVE_BROADCAST_REFRESH_SECONDS,
);

export async function getCachedParticipantBroadcasts(): Promise<CachedParticipantBroadcastsResult> {
  const policy = getParticipantBroadcastRefreshPolicy();
  const result = policy.intervalSeconds === ACTIVE_BROADCAST_REFRESH_SECONDS
    ? await getFromActiveProcessCache()
    : await getFromInactiveProcessCache();

  if (result.status === "error") {
    console.warn("[chzzk] LIVE snapshot unavailable", { cache: "miss" });
    const error = result.cause instanceof BroadcastLoadError ? result.cause.kind : "upstream";
    return { status: "error", participants: getParticipants(), error };
  }

  if (result.status === "stale") {
    console.warn("[chzzk] serving stale LIVE snapshot after refresh failure", {
      cacheAgeSeconds: result.cacheAgeSeconds,
    });
  }

  return {
    status: result.status,
    broadcasts: normalizeBroadcastThumbnails(
      refreshParticipantBroadcastMetadata(result.snapshot.broadcasts, getParticipants()),
    ),
    ambiguousMatches: result.snapshot.ambiguousMatches,
    risingHistoryReady: result.snapshot.risingHistoryReady,
    fetchedAt: result.snapshot.fetchedAt,
    cacheAgeSeconds: result.cacheAgeSeconds,
  };
}
