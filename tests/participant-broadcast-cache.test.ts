import { describe, expect, it, vi } from "vitest";

import { createParticipantBroadcastCache } from "../src/lib/participant-broadcast-cache";
import type { ParticipantBroadcastSnapshot } from "../src/types/participant-broadcast";

function snapshot(fetchedAt: string): ParticipantBroadcastSnapshot {
  return { broadcasts: [], ambiguousMatches: [], fetchedAt };
}

describe("participant broadcast cache", () => {
  it("reuses a snapshot inside the TTL and refreshes it after expiry", async () => {
    let currentTime = Date.parse("2026-01-01T00:00:00.000Z");
    const load = vi
      .fn<() => Promise<ParticipantBroadcastSnapshot>>()
      .mockResolvedValueOnce(snapshot("2026-01-01T00:00:00.000Z"))
      .mockResolvedValueOnce(snapshot("2026-01-01T00:15:01.000Z"));
    const getCached = createParticipantBroadcastCache(load, 900, () => currentTime);

    await getCached();
    currentTime += 899_000;
    await getCached();
    currentTime += 2_000;
    await getCached();

    expect(load).toHaveBeenCalledTimes(2);
  });

  it("supports the five-minute LIVE refresh TTL used during pre-open and open hours", async () => {
    let currentTime = Date.parse("2026-01-01T00:00:00.000Z");
    const load = vi
      .fn<() => Promise<ParticipantBroadcastSnapshot>>()
      .mockResolvedValueOnce(snapshot("2026-01-01T00:00:00.000Z"))
      .mockResolvedValueOnce(snapshot("2026-01-01T00:05:00.000Z"));
    const getCached = createParticipantBroadcastCache(load, 300, () => currentTime);

    await getCached();
    currentTime += 299_000;
    await getCached();
    currentTime += 1_000;
    await getCached();

    expect(load).toHaveBeenCalledTimes(2);
  });

  it("deduplicates concurrent refreshes", async () => {
    const load = vi.fn<() => Promise<ParticipantBroadcastSnapshot>>().mockResolvedValue(snapshot("2026-01-01T00:00:00.000Z"));
    const getCached = createParticipantBroadcastCache(load, 900, () => Date.parse("2026-01-01T00:00:00.000Z"));

    await Promise.all([getCached(), getCached(), getCached()]);

    expect(load).toHaveBeenCalledTimes(1);
  });

  it("returns the last successful snapshot as stale when refresh fails", async () => {
    let currentTime = Date.parse("2026-01-01T00:00:00.000Z");
    const load = vi
      .fn<() => Promise<ParticipantBroadcastSnapshot>>()
      .mockResolvedValueOnce(snapshot("2026-01-01T00:00:00.000Z"))
      .mockRejectedValueOnce(new Error("network"));
    const getCached = createParticipantBroadcastCache(load, 900, () => currentTime);

    await getCached();
    currentTime += 901_000;

    await expect(getCached()).resolves.toMatchObject({ status: "stale", cacheAgeSeconds: 901 });
  });

  it("uses fetchedAt when a new process receives an older shared-cache snapshot", async () => {
    const load = vi.fn<() => Promise<ParticipantBroadcastSnapshot>>().mockResolvedValue(snapshot("2026-01-01T00:00:00.000Z"));
    const getCached = createParticipantBroadcastCache(
      load,
      900,
      () => Date.parse("2026-01-01T00:15:01.000Z"),
    );

    await expect(getCached()).resolves.toMatchObject({ status: "stale", cacheAgeSeconds: 901 });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("returns an error when the first fetch fails", async () => {
    const getCached = createParticipantBroadcastCache(
      async () => Promise.reject(new Error("network")),
      900,
      () => Date.parse("2026-01-01T00:00:00.000Z"),
    );

    await expect(getCached()).resolves.toMatchObject({ status: "error" });
  });
});
