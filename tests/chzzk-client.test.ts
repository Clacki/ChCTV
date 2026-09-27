import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentChzzkLives } from "../src/server/chzzk/client";

const originalClientId = process.env.CHZZK_CLIENT_ID;
const originalClientSecret = process.env.CHZZK_CLIENT_SECRET;

function rawLive(overrides: Record<string, unknown> = {}) {
  return {
    liveId: 1,
    liveTitle: "live title",
    concurrentUserCount: 100,
    channelId: "a".repeat(32),
    channelName: "streamer",
    channelImageUrl: null,
    liveThumbnailImageUrl: null,
    ...overrides,
  };
}

function livesResponse(data: unknown[]) {
  return new Response(JSON.stringify({ content: { data, page: { next: null } } }), { status: 200 });
}

beforeEach(() => {
  process.env.CHZZK_CLIENT_ID = "test-client-id";
  process.env.CHZZK_CLIENT_SECRET = "test-client-secret";
});

afterEach(() => {
  vi.unstubAllGlobals();
  process.env.CHZZK_CLIENT_ID = originalClientId;
  process.env.CHZZK_CLIENT_SECRET = originalClientSecret;
});

describe("CHZZK LIVE collection", () => {
  it("preserves broadcasts from every API category for later display filtering", async () => {
    const fetch = vi.fn().mockResolvedValue(
      livesResponse([
        rawLive({ channelId: "a".repeat(32), liveCategoryValue: "Grand Theft Auto V" }),
        rawLive({ channelId: "b".repeat(32), liveCategoryValue: "League of Legends" }),
        rawLive({ channelId: "c".repeat(32), liveCategoryValue: null }),
      ]),
    );
    vi.stubGlobal("fetch", fetch);

    await expect(getCurrentChzzkLives()).resolves.toEqual([
      expect.objectContaining({ channelId: "a".repeat(32), liveCategoryValue: "Grand Theft Auto V" }),
      expect.objectContaining({ channelId: "b".repeat(32), liveCategoryValue: "League of Legends" }),
      expect.objectContaining({ channelId: "c".repeat(32), liveCategoryValue: null }),
    ]);
  });
});
