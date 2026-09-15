import { describe, expect, it } from "vitest";

import { getNextDefaultMultiviewName, getSavedMultiviewStatus } from "../src/features/multiview/saved-multiview";
import type { StreamCardData } from "../src/types/stream-card";

const stream = (channelId: string): StreamCardData => ({
  id: `channel:${channelId}`,
  channelId,
  title: "Live stream",
  thumbnailUrl: null,
  channelImageUrl: null,
  isLive: true,
  viewerCount: 0,
  streamerName: "Streamer",
  rpName: null,
  category: null,
  tags: [],
  aliases: [],
});

describe("getSavedMultiviewStatus", () => {
  it("counts saved channel IDs against the current live stream snapshot", () => {
    const liveStreams = new Map([
      ["channel-a", stream("channel-a")],
      ["channel-c", stream("channel-c")],
      ["channel-e", stream("channel-e")],
    ]);

    expect(getSavedMultiviewStatus(["channel-a", "channel-b", "channel-c", "channel-d", "channel-e"], liveStreams)).toEqual({
      channelCount: 5,
      liveCount: 3,
    });
  });
});

describe("getNextDefaultMultiviewName", () => {
  it("finds the next unused default name", () => {
    expect(getNextDefaultMultiviewName([
      { name: "멀티뷰 1" },
      { name: "멀티뷰 2" },
      { name: "직접 입력한 이름" },
      { name: "멀티뷰 4" },
    ])).toBe("멀티뷰 3");
  });
});
