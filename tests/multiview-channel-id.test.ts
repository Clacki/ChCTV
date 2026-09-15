import { describe, expect, it } from "vitest";

import { getValidMultiviewChannelIds } from "../src/features/multiview/channel-id";

describe("getValidMultiviewChannelIds", () => {
  it("keeps valid channel IDs in order, removes duplicates, and limits the result to six", () => {
    const channelIds = [
      "A".repeat(32),
      "a".repeat(32),
      "b".repeat(32),
      "c".repeat(32),
      "d".repeat(32),
      "e".repeat(32),
      "f".repeat(32),
      "0".repeat(32),
    ];

    expect(getValidMultiviewChannelIds(channelIds)).toEqual([
      "a".repeat(32),
      "b".repeat(32),
      "c".repeat(32),
      "d".repeat(32),
      "e".repeat(32),
      "f".repeat(32),
    ]);
  });

  it("ignores malformed channel IDs", () => {
    expect(getValidMultiviewChannelIds(["", "not-a-channel", "a".repeat(31)])).toEqual([]);
  });
});
