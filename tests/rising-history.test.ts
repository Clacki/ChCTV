import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { mergeParticipantsWithLives } from "../src/lib/participant-broadcasts";
import {
  appendRisingSnapshot,
  applyServerRisingMetadata,
  createServerRisingHistory,
  recordRisingHistoryWithRedis,
  type RedisSnapshot,
} from "../src/server/chzzk/rising-history";
import { shouldRecordRisingHistory } from "../src/lib/participant-broadcast-refresh-policy";
import type { Participant } from "../src/types/participant";
import type { ChzzkLiveChannel } from "../src/types/participant-broadcast";

const channelId = "a".repeat(32);
const participant: Participant = { streamerName: "streamer", rpName: null, channelId, affiliations: [], groups: [], tags: [], aliases: [] };
const broadcasts = (viewerCount: number) => mergeParticipantsWithLives([participant], [
  { channelId, channelName: "streamer", liveTitle: "live", viewerCount, thumbnailUrl: null, channelImageUrl: null, tags: [], categoryType: null, liveCategory: null, liveCategoryValue: null } satisfies ChzzkLiveChannel,
]).broadcasts;
const snapshots = (counts: number[]): RedisSnapshot[] => counts.map((viewerCount, index) => ({
  timestamp: index * 300_000,
  viewers: { [channelId]: viewerCount },
}));

describe("shared rising history", () => {
  it.each([
    ["PRE_OPEN", "2024-01-01T08:00:00.000Z", true],
    ["OPEN", "2024-01-01T09:00:00.000Z", true],
    ["CLOSED", "2024-01-01T07:00:00.000Z", false],
    ["DAY_OFF", "2024-01-05T09:00:00.000Z", false],
  ])("writes a fresh snapshot only during %s", (_status, value, expected) => {
    expect(shouldRecordRisingHistory(new Date(value))).toBe(expected);
  });

  it("adds rising metadata to a participant broadcast and exposes readiness after two snapshots", () => {
    const history = createServerRisingHistory(snapshots([120, 140]));
    const result = applyServerRisingMetadata(broadcasts(140), history.results)[0];

    expect(history.ready).toBe(true);
    expect(result).toMatchObject({ isRising: true, risingIncrease: 20, risingSortValue: 20 });
    expect(result.risingRate).toBeCloseTo(20 / 120);
  });

  it("uses the ten-minute increase after three snapshots and excludes a recent decline", () => {
    const sustained = createServerRisingHistory(snapshots([120, 140, 165]));
    const declining = createServerRisingHistory(snapshots([120, 180, 160]));

    expect(sustained.results[0]).toMatchObject({ isRising: true, increase: 25, sortValue: 45 });
    expect(declining.results[0]).toMatchObject({ isRising: false, increase: null, sortValue: null });
  });

  it("keeps recent rising metadata separate from a three-snapshot sort value", () => {
    const recovered = createServerRisingHistory(snapshots([124, 98, 116])).results[0];
    const small = createServerRisingHistory(snapshots([112, 111, 136])).results[0];
    const large = createServerRisingHistory(snapshots([400, 390, 472])).results[0];

    expect(recovered).toMatchObject({ isRising: true, increase: 18, sortValue: -8 });
    expect(recovered.rate).toBeCloseTo(18 / 98);
    expect(small).toMatchObject({ isRising: true, increase: 25, sortValue: 24 });
    expect(large).toMatchObject({ isRising: true, increase: 82, sortValue: 72 });
  });

  it("does not append a duplicate cycle snapshot and resets readiness after a long gap", () => {
    const first = appendRisingSnapshot([], broadcasts(120), 0);
    const duplicate = appendRisingSnapshot(first.snapshots, broadcasts(140), 60_000);
    const reset = appendRisingSnapshot(first.snapshots, broadcasts(200), 960_000);

    expect(duplicate.didAppend).toBe(false);
    expect(duplicate.snapshots).toEqual(first.snapshots);
    expect(reset.snapshots).toEqual([{ timestamp: 960_000, viewers: { [channelId]: 200 } }]);
    expect(createServerRisingHistory(reset.snapshots).ready).toBe(false);
  });

  it("retains no more than three snapshots", () => {
    let stored: RedisSnapshot[] = [];
    for (const [index, viewerCount] of [120, 140, 165, 180].entries()) {
      stored = appendRisingSnapshot(stored, broadcasts(viewerCount), index * 300_000).snapshots;
    }

    expect(stored).toHaveLength(3);
    expect(stored[0].viewers[channelId]).toBe(140);
  });

  it("writes only a fresh snapshot and degrades safely when Redis fails", async () => {
    const redis = { get: vi.fn().mockResolvedValue(snapshots([120])), set: vi.fn().mockResolvedValue("OK") };

    await expect(recordRisingHistoryWithRedis(redis, broadcasts(140), 300_000)).resolves.toMatchObject({ ready: true });
    expect(redis.set).toHaveBeenCalledTimes(1);

    const duplicateRedis = { get: vi.fn().mockResolvedValue(snapshots([120])), set: vi.fn() };
    await recordRisingHistoryWithRedis(duplicateRedis, broadcasts(140), 60_000);
    expect(duplicateRedis.set).not.toHaveBeenCalled();

    await expect(recordRisingHistoryWithRedis({ get: vi.fn().mockRejectedValue(new Error("unavailable")), set: vi.fn() }, broadcasts(140), 300_000)).resolves.toBeNull();
  });
});
