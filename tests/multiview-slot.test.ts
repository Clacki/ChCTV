import { describe, expect, it } from "vitest";

import {
  createMultiviewSlots,
  getMultiviewChannelIds,
  getMultiviewSlotLabel,
  getMultiviewSlotKeyByChannelId,
  removeMultiviewSlotChannel,
  swapMainWithSub,
} from "../src/features/multiview/multiview-slot";
import { getChzzkChatUrl } from "../src/features/multiview/chzzk-viewer";

describe("getMultiviewSlotLabel", () => {
  it("uses selection order to derive Main and Sub slot labels", () => {
    expect([0, 1, 2, 3, 4, 5].map(getMultiviewSlotLabel)).toEqual([
      "Main",
      "Sub 1",
      "Sub 2",
      "Sub 3",
      "Sub 4",
      "Sub 5",
    ]);
  });

  it("swaps only Main and the requested Sub slot", () => {
    const slots = createMultiviewSlots(["A", "B", "C", "D"]);

    const swappedSlots = swapMainWithSub(slots, "sub2");

    expect(swappedSlots).toMatchObject({
      main: "C",
      sub1: "B",
      sub2: "A",
      sub3: "D",
    });
    expect(getChzzkChatUrl(swappedSlots.main ?? "")).toBe("https://chzzk.naver.com/live/C/chat");
    expect(["A", "B", "C", "D"].map((channelId) => getMultiviewSlotKeyByChannelId(swappedSlots, channelId))).toEqual([
      "sub2",
      "sub1",
      "main",
      "sub3",
    ]);
  });

  it("compacts remaining slots and promotes the first Sub when Main is removed", () => {
    const slots = createMultiviewSlots(["A", "B", "C", "D"]);

    expect(getMultiviewChannelIds(removeMultiviewSlotChannel(slots, "A"))).toEqual(["B", "C", "D"]);
    expect(getMultiviewChannelIds(removeMultiviewSlotChannel(slots, "C"))).toEqual(["A", "B", "D"]);
  });
});
