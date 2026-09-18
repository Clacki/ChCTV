import { afterEach, describe, expect, it, vi } from "vitest";

import { getChzzkChannelVods } from "../src/server/chzzk/vod-client";
import { mapChzzkVod } from "../src/server/chzzk/vod-mapper";

const channelId = "a".repeat(32);
const startAt = Date.parse("2026-01-01T00:00:00.000Z");

function rawVod(overrides: Record<string, unknown> = {}) {
  return {
    videoNo: 1,
    videoTitle: "다시보기",
    thumbnailImageUrl: "https://cdn.example.com/thumb.jpg",
    readCount: 42,
    duration: 3600,
    publishDateAt: startAt,
    videoType: "REPLAY",
    watchTimeline: { lastPosition: 10 },
    channel: {
      channelId,
      channelName: "참가자",
      channelImageUrl: "https://cdn.example.com/channel.jpg",
    },
    ...overrides,
  };
}

function pageResponse(page: number, totalPages: number, data: unknown[]) {
  return new Response(JSON.stringify({ content: { page, totalPages, data } }), { status: 200 });
}

afterEach(() => vi.unstubAllGlobals());

describe("CHZZK VOD mapper", () => {
  it("allowlists public VOD fields and excludes personal watch state", () => {
    expect(mapChzzkVod(rawVod())).toEqual({
      videoNo: 1,
      channelId,
      title: "다시보기",
      thumbnailUrl: "https://cdn.example.com/thumb.jpg",
      viewCount: 42,
      duration: 3600,
      publishedAt: startAt,
      videoType: "REPLAY",
      channelName: "참가자",
      channelImageUrl: "https://cdn.example.com/channel.jpg",
    });
  });

  it("ignores incomplete upstream items", () => {
    expect(mapChzzkVod({ videoNo: 1 })).toBeNull();
  });
});

describe("CHZZK VOD pagination", () => {
  it("continues through fresh pages and stops after the first older VOD", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(pageResponse(1, 3, [rawVod({ videoNo: 1, publishDateAt: startAt + 1 })]))
      .mockResolvedValueOnce(
        pageResponse(2, 3, [
          rawVod({ videoNo: 2, publishDateAt: startAt + 1 }),
          rawVod({ videoNo: 3, publishDateAt: startAt - 1 }),
        ]),
      );
    vi.stubGlobal("fetch", fetch);

    await expect(getChzzkChannelVods(channelId, startAt)).resolves.toMatchObject([
      { videoNo: 1 },
      { videoNo: 2 },
    ]);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls.map(([url]) => new URL(url).searchParams.get("page"))).toEqual(["1", "2"]);
  });

  it("keeps only REPLAY VODs while respecting the API page bound", async () => {
    const fetch = vi.fn().mockResolvedValue(
      pageResponse(1, 1, [
        rawVod({ videoNo: 1, videoType: "CLIP" }),
        rawVod({ videoNo: 2, publishDateAt: startAt - 1 }),
      ]),
    );
    vi.stubGlobal("fetch", fetch);

    await expect(getChzzkChannelVods(channelId, startAt)).resolves.toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("accepts the API's empty-channel page metadata", async () => {
    const fetch = vi.fn().mockResolvedValue(pageResponse(0, 0, []));
    vi.stubGlobal("fetch", fetch);

    await expect(getChzzkChannelVods(channelId, startAt)).resolves.toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("stops after merging a page containing a known VOD", async () => {
    const fetch = vi.fn().mockResolvedValue(
      pageResponse(1, 3, [rawVod({ videoNo: 12 }), rawVod({ videoNo: 10 })]),
    );
    vi.stubGlobal("fetch", fetch);

    await expect(getChzzkChannelVods(channelId, startAt, new Set([10]))).resolves.toHaveLength(2);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
