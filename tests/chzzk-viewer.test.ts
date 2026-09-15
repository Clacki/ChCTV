import { describe, expect, it } from "vitest";

import {
  getChzzkChatUrl,
  getChzzkLiveUrl,
  getChzzkViewerCrop,
} from "../src/features/multiview/chzzk-viewer";

describe("getChzzkLiveUrl", () => {
  it("builds the CHZZK LIVE page URL from a channel ID", () => {
    expect(getChzzkLiveUrl("17f0cfcba4ff608de5eabb5110d134d0")).toBe(
      "https://chzzk.naver.com/live/17f0cfcba4ff608de5eabb5110d134d0",
    );
  });

  it("builds the Main channel chat URL from the same channel ID", () => {
    expect(getChzzkChatUrl("29f20622463916fa48ad735057b145ce")).toBe(
      "https://chzzk.naver.com/live/29f20622463916fa48ad735057b145ce/chat",
    );
  });

  it("keeps the legacy crop settings available for viewer profiles", () => {
    expect(getChzzkViewerCrop("main")).toMatchObject({ cropTop: "3rem", cropBottom: "1rem" });
    expect(getChzzkViewerCrop("sub")).toMatchObject({ cropTop: "2.5rem", cropBottom: "1rem" });
  });
});
