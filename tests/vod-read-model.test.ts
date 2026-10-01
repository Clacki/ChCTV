import { describe, expect, it } from "vitest";

import { createVodListResponse } from "../src/server/vods/vod-read-model";
import type { Participant } from "../src/types/participant";
import type { Vod } from "../src/types/vod";

const participant: Participant = {
  streamerName: "streamer",
  rpName: null,
  channelId: "a".repeat(32),
  affiliations: [{ type: "organization", name: "Police" }],
  groups: [],
  tags: [],
  aliases: [],
};

const vod = (videoNo: number, publishedAt: number, channelId = participant.channelId!): Vod => ({
  videoNo,
  channelId,
  title: `VOD ${videoNo}`,
  thumbnailUrl: null,
  viewCount: 1,
  duration: 60,
  publishedAt,
  videoType: "REPLAY",
  videoCategory: "Grand_Theft_Auto_V",
  videoCategoryValue: "Grand Theft Auto V",
  liveOpenDate: null,
  url: `https://chzzk.naver.com/video/${videoNo}`,
  channelName: "CHZZK channel",
  channelImageUrl: null,
});

describe("VOD read model", () => {
  it("returns only public list fields in deterministic newest-first order", () => {
    const response = createVodListResponse([vod(1, 10), vod(3, 20), vod(2, 20)], [participant]);

    expect(response).toEqual({
      items: [
        { videoNo: 3, channelId: participant.channelId, title: "VOD 3", thumbnailUrl: null, publishedAt: "1970-01-01T00:00:00.020Z", duration: 60, url: "https://chzzk.naver.com/video/3", participant: { name: "streamer", channelId: participant.channelId, affiliations: ["Police"] } },
        { videoNo: 2, channelId: participant.channelId, title: "VOD 2", thumbnailUrl: null, publishedAt: "1970-01-01T00:00:00.020Z", duration: 60, url: "https://chzzk.naver.com/video/2", participant: { name: "streamer", channelId: participant.channelId, affiliations: ["Police"] } },
        { videoNo: 1, channelId: participant.channelId, title: "VOD 1", thumbnailUrl: null, publishedAt: "1970-01-01T00:00:00.010Z", duration: 60, url: "https://chzzk.naver.com/video/1", participant: { name: "streamer", channelId: participant.channelId, affiliations: ["Police"] } },
      ],
      total: 3,
    });
  });

  it("keeps a VOD whose channel is no longer in the participant catalog", () => {
    const response = createVodListResponse([vod(1, 10, "b".repeat(32))], [participant]);

    expect(response.items[0]?.participant).toBeNull();
  });
});
