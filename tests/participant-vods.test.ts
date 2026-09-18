import { describe, expect, it, vi } from "vitest";

import { getParticipants } from "../src/lib/participants";
import type { Participant } from "../src/types/participant";
import type { Vod } from "../src/types/vod";

const getChzzkChannelVods = vi.hoisted(() => vi.fn());

vi.mock("../src/server/chzzk/vod-client", () => ({
  ChzzkVodApiError: class ChzzkVodApiError extends Error {
    constructor(
      public readonly kind: string,
      public readonly channelId: string,
      public readonly status?: number,
    ) {
      super("CHZZK VOD request failed");
    }
  },
  getChzzkChannelVods,
}));

import { getParticipantVods } from "../src/server/chzzk/participant-vods";

describe("participant VOD collection", () => {
  it("deduplicates videoNo values and isolates a failed channel", async () => {
    const channelIds = getParticipants().slice(0, 3).flatMap((participant) => (participant.channelId ? [participant.channelId] : []));
    getChzzkChannelVods.mockImplementation((channelId: string) => {
      if (channelId === channelIds[1]) {
        return Promise.reject(new Error("network"));
      }

      return Promise.resolve([
        {
          videoNo: 10,
          channelId,
          title: "다시보기",
          thumbnailUrl: null,
          viewCount: 1,
          duration: 1,
          publishedAt: 1,
          videoType: "REPLAY",
          channelName: "참가자",
          channelImageUrl: null,
        },
      ]);
    });

    const result = await getParticipantVods({ startAt: 1, channelIds });

    expect(result.vods).toHaveLength(1);
    expect(result.failures).toEqual([{ channelId: channelIds[1], kind: "unknown" }]);
    expect(getChzzkChannelVods).toHaveBeenCalledTimes(3);
  });

  it("limits channel collection to five concurrent requests and continues after failures", async () => {
    const participants: Participant[] = Array.from({ length: 8 }, (_, index) => ({
      streamerName: `참가자 ${index}`,
      rpName: null,
      channelId: String(index).padStart(32, "0"),
      affiliations: [],
      groups: [],
      tags: [],
      aliases: [],
    }));
    let active = 0;
    let maximum = 0;
    const load = async (channelId: string): Promise<Vod[]> => {
      active += 1;
      maximum = Math.max(maximum, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;

      if (channelId === participants[2].channelId) {
        throw new Error("network");
      }

      return [];
    };

    const result = await getParticipantVods({ startAt: 1 }, participants, load);

    expect(maximum).toBeLessThanOrEqual(5);
    expect(result.failures).toHaveLength(1);
  });

  it("merges new VODs and refreshes metadata for VODs seen again", async () => {
    const channelId = "b".repeat(32);
    const participant: Participant = {
      streamerName: "참가자",
      rpName: null,
      channelId,
      affiliations: [],
      groups: [],
      tags: [],
      aliases: [],
    };
    const existing: Vod = {
      videoNo: 10,
      channelId,
      title: "이전 제목",
      thumbnailUrl: null,
      viewCount: 1,
      duration: 1,
      publishedAt: 1,
      videoType: "REPLAY",
      channelName: "이전 채널",
      channelImageUrl: null,
    };

    const result = await getParticipantVods(
      { startAt: 1, existingVods: [existing] },
      [participant],
      async (_id, _startAt, knownVideoNos) => {
        expect(knownVideoNos).toEqual(new Set([10]));
        return [
          { ...existing, videoNo: 11, title: "신규" },
          { ...existing, title: "갱신 제목", viewCount: 99, channelName: "갱신 채널" },
        ];
      },
    );

    expect(result.vods).toHaveLength(2);
    expect(result.vods.find((vod) => vod.videoNo === 10)).toMatchObject({ title: "갱신 제목", viewCount: 99 });
  });
});
