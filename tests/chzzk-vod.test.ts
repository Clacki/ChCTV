import { afterEach, describe, expect, it, vi } from "vitest";

import { ChzzkVodApiError, getChzzkChannelVods } from "../src/server/chzzk/vod-client";
import { mapChzzkVod } from "../src/server/chzzk/vod-mapper";

const channelId = "a".repeat(32);
const startAt = Date.parse("2026-01-01T00:00:00.000Z");
const endAt = Date.parse("2026-01-02T00:00:00.000Z");

function rawVod(overrides: Record<string, unknown> = {}) {
  return {
    videoNo: 1,
    videoTitle: "다시보기",
    thumbnailImageUrl: "https://cdn.example.com/thumb.jpg",
    readCount: 42,
    duration: 3600,
    publishDateAt: startAt,
    videoType: "REPLAY",
    videoCategory: "Grand_Theft_Auto_V",
    videoCategoryValue: "Grand Theft Auto V",
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
      videoCategory: "Grand_Theft_Auto_V",
      videoCategoryValue: "Grand Theft Auto V",
      channelName: "참가자",
      channelImageUrl: "https://cdn.example.com/channel.jpg",
    });
  });

  it("ignores incomplete upstream items", () => {
    expect(mapChzzkVod({ videoNo: 1 })).toBeNull();
  });
});

describe("CHZZK VOD pagination", () => {
  it("reads every page even after an out-of-range VOD so a later target is not missed", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(pageResponse(1, 3, [rawVod({ videoNo: 1, publishDateAt: startAt + 1 })]))
      .mockResolvedValueOnce(
        pageResponse(2, 3, [rawVod({ videoNo: 2, publishDateAt: startAt - 1 })]),
      );
    fetch.mockResolvedValueOnce(pageResponse(3, 3, [rawVod({ videoNo: 3, publishDateAt: startAt + 2 })]));
    vi.stubGlobal("fetch", fetch);

    await expect(getChzzkChannelVods(channelId, startAt, endAt)).resolves.toMatchObject([
      { videoNo: 1 },
      { videoNo: 3 },
    ]);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls.map(([url]) => new URL(url).searchParams.get("page"))).toEqual(["1", "2", "3"]);
  });

  it("keeps only in-range GTA V REPLAY VODs", async () => {
    const fetch = vi.fn().mockResolvedValue(
      pageResponse(1, 1, [
        rawVod({ videoNo: 1, videoType: "CLIP" }),
        rawVod({ videoNo: 2, videoCategoryValue: "Project Zomboid" }),
        rawVod({ videoNo: 3, publishDateAt: startAt - 1 }),
        rawVod({ videoNo: 4, publishDateAt: endAt }),
        rawVod({ videoNo: 5, publishDateAt: endAt - 1 }),
      ]),
    );
    vi.stubGlobal("fetch", fetch);

    await expect(getChzzkChannelVods(channelId, startAt, endAt)).resolves.toMatchObject([{ videoNo: 5 }]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("accepts the API's empty-channel page metadata", async () => {
    const fetch = vi.fn().mockResolvedValue(pageResponse(0, 0, []));
    vi.stubGlobal("fetch", fetch);

    await expect(getChzzkChannelVods(channelId, startAt, endAt)).resolves.toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("treats an item with missing required category data as an invalid upstream response", async () => {
    const fetch = vi.fn().mockResolvedValue(
      pageResponse(1, 1, [rawVod({ videoCategoryValue: undefined })]),
    );
    vi.stubGlobal("fetch", fetch);

    await expect(getChzzkChannelVods(channelId, startAt, endAt)).rejects.toBeInstanceOf(ChzzkVodApiError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
