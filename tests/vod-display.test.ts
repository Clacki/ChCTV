import { describe, expect, it } from "vitest";
import { createVodDisplayItems, formatVodDuration, formatVodViewCount } from "../src/lib/vod-display";
import type { Participant } from "../src/types/participant";
import type { Vod } from "../src/types/vod";

const vod = (overrides: Partial<Vod> = {}): Vod => ({ videoNo: 1, channelId: "a".repeat(32), title: "다시보기", thumbnailUrl: null, viewCount: 12_345, duration: 3723, publishedAt: 2, videoType: "REPLAY", channelName: "CHZZK 채널", channelImageUrl: null, ...overrides });

describe("VOD display data", () => {
  it("sorts newest first and matches a participant by channelId", () => {
    const participant: Participant = { streamerName: "스트리머", rpName: "RP", channelId: "a".repeat(32), affiliations: [], groups: [], tags: [], aliases: [] };
    const items = createVodDisplayItems([vod({ videoNo: 1, publishedAt: 1 }), vod({ videoNo: 2, publishedAt: 2 })], [participant]);
    expect(items.map((item) => item.vod.videoNo)).toEqual([2, 1]);
    expect(items[0].participant?.streamerName).toBe("스트리머");
    expect(createVodDisplayItems([vod({ channelId: "b".repeat(32) })], [participant])[0].participant).toBeNull();
  });
  it("formats duration and view metadata for cards", () => {
    expect(formatVodDuration(3723)).toBe("1:02:03");
    expect(formatVodViewCount(12_345)).toBe("1.2만");
  });
});
