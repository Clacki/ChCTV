import { describe, expect, it, vi } from "vitest";

import {
  readVodSnapshotWithRedis,
  VOD_SNAPSHOT_KEY,
  writeVodSnapshotWithRedis,
} from "../src/server/vods/vod-snapshot-store";
import type { VodSnapshot } from "../src/types/vod-snapshot";

const snapshot = (): VodSnapshot => ({
  version: 1,
  refreshedAt: 2,
  vods: [],
  failures: [],
  startedAt: 1,
  completedAt: 2,
});

describe("VOD snapshot Redis store", () => {
  it("reads the latest snapshot from its dedicated key", async () => {
    const redis = { get: vi.fn().mockResolvedValue(snapshot()), set: vi.fn() };

    await expect(readVodSnapshotWithRedis(redis)).resolves.toEqual(snapshot());
    expect(redis.get).toHaveBeenCalledWith(VOD_SNAPSHOT_KEY);
  });

  it("returns null when the snapshot has not been created", async () => {
    const redis = { get: vi.fn().mockResolvedValue(null), set: vi.fn() };

    await expect(readVodSnapshotWithRedis(redis)).resolves.toBeNull();
  });

  it("rejects malformed Redis values", async () => {
    const redis = { get: vi.fn().mockResolvedValue({ version: 1, vods: [], failures: [] }), set: vi.fn() };

    await expect(readVodSnapshotWithRedis(redis)).rejects.toThrow("VOD snapshot is invalid");
  });

  it("overwrites the one latest-snapshot key without creating history", async () => {
    const redis = { get: vi.fn(), set: vi.fn().mockResolvedValue("OK") };

    await writeVodSnapshotWithRedis(redis, snapshot());
    expect(redis.set).toHaveBeenCalledOnce();
    expect(redis.set).toHaveBeenCalledWith(VOD_SNAPSHOT_KEY, snapshot());
  });
});
