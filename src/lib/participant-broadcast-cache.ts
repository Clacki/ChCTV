import type { ParticipantBroadcastSnapshot } from "../types/participant-broadcast";

export type BroadcastCacheState =
  | { status: "fresh"; snapshot: ParticipantBroadcastSnapshot; cacheAgeSeconds: number }
  | { status: "stale"; snapshot: ParticipantBroadcastSnapshot; cacheAgeSeconds: number }
  | { status: "error"; cause: unknown };

type LoadSnapshot = () => Promise<ParticipantBroadcastSnapshot>;

export function createParticipantBroadcastCache(
  loadSnapshot: LoadSnapshot,
  ttlSeconds: number,
  now: () => number = Date.now,
): () => Promise<BroadcastCacheState> {
  let snapshot: ParticipantBroadcastSnapshot | null = null;
  let refreshing: Promise<ParticipantBroadcastSnapshot> | null = null;

  function getCacheAgeSeconds(value: ParticipantBroadcastSnapshot): number {
    return Math.max(0, (now() - Date.parse(value.fetchedAt)) / 1000);
  }

  return async () => {
    const cacheAgeSeconds = snapshot ? getCacheAgeSeconds(snapshot) : null;

    if (snapshot && cacheAgeSeconds !== null && cacheAgeSeconds < ttlSeconds) {
      return { status: "fresh", snapshot, cacheAgeSeconds };
    }

    refreshing ??= loadSnapshot();

    try {
      snapshot = await refreshing;
      const refreshedCacheAgeSeconds = getCacheAgeSeconds(snapshot);

      return {
        status: refreshedCacheAgeSeconds < ttlSeconds ? "fresh" : "stale",
        snapshot,
        cacheAgeSeconds: refreshedCacheAgeSeconds,
      };
    } catch (cause) {
      if (snapshot && cacheAgeSeconds !== null) {
        return { status: "stale", snapshot, cacheAgeSeconds };
      }

      return { status: "error", cause };
    } finally {
      refreshing = null;
    }
  };
}
