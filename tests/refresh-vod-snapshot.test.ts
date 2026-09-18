import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Participant } from "../src/types/participant";
import type { Vod } from "../src/types/vod";

const readVodSnapshot = vi.hoisted(() => vi.fn());
const writeVodSnapshot = vi.hoisted(() => vi.fn());
const getParticipantVods = vi.hoisted(() => vi.fn());

vi.mock("@/server/vods/vod-snapshot-store", () => ({ readVodSnapshot, writeVodSnapshot }));
vi.mock("@/server/chzzk/participant-vods", () => ({ getParticipantVods }));

import { refreshVodSnapshot } from "../src/server/vods/refresh-vod-snapshot";

const participant = (channelId: string): Participant => ({
  streamerName: channelId,
  rpName: null,
  channelId,
  affiliations: [],
  groups: [],
  tags: [],
  aliases: [],
});

const vod = (videoNo: number, channelId: string): Vod => ({
  videoNo,
  channelId,
  title: "다시보기",
  thumbnailUrl: null,
  viewCount: 1,
  duration: 1,
  publishedAt: 1,
  videoType: "REPLAY",
  channelName: channelId,
  channelImageUrl: null,
});

describe("VOD snapshot refresh", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("uses the previous snapshot as incremental input and writes only the refreshed snapshot", async () => {
    const participants = [participant("a"), participant("b")];
    const previous = { version: 1 as const, refreshedAt: 1, vods: [vod(10, "a"), vod(20, "b")], failures: [{ channelId: "b", kind: "network" as const }], startedAt: 1, completedAt: 1 };
    readVodSnapshot.mockResolvedValue(previous);
    getParticipantVods.mockResolvedValue({ vods: [vod(11, "a"), vod(20, "b")], failures: [], attemptedChannelCount: 1 });

    const snapshot = await refreshVodSnapshot(0, participants);

    expect(getParticipantVods).toHaveBeenCalledWith({ channelIds: ["a", "b"], existingVods: previous.vods }, participants);
    expect(writeVodSnapshot).toHaveBeenCalledWith(expect.objectContaining({ version: 1, vods: [vod(11, "a"), vod(20, "b")], failures: [] }));
    expect(snapshot.refreshedAt).toBeGreaterThan(0);
  });

  it("preserves the stored snapshot when collection fails before a replacement is ready", async () => {
    const participants = [participant("a")];
    readVodSnapshot.mockResolvedValue({ version: 1 as const, refreshedAt: 1, vods: [vod(10, "a")], failures: [], startedAt: 1, completedAt: 1 });
    getParticipantVods.mockRejectedValue(new Error("collector unavailable"));

    await expect(refreshVodSnapshot(0, participants)).rejects.toThrow("collector unavailable");
    expect(writeVodSnapshot).not.toHaveBeenCalled();
  });

  it("keeps the previous snapshot when every channel fails", async () => {
    const participants = [participant("a"), participant("b")];
    readVodSnapshot.mockResolvedValue({ version: 1 as const, refreshedAt: 1, vods: [vod(10, "a")], failures: [], startedAt: 1, completedAt: 1 });
    getParticipantVods.mockResolvedValue({
      vods: [vod(10, "a")],
      failures: [{ channelId: "a", kind: "network" }, { channelId: "b", kind: "network" }],
      attemptedChannelCount: 2,
    });

    await expect(refreshVodSnapshot(0, participants)).rejects.toThrow("VOD collection failed for every channel in the batch");
    expect(writeVodSnapshot).not.toHaveBeenCalled();
  });

  it("removes channels no longer in the catalog while preserving a different batch's VODs", async () => {
    const participants = [participant("a"), participant("b"), participant("c"), participant("d"), participant("e"), participant("f"), participant("g"), participant("h"), participant("i"), participant("j"), participant("k")];
    const previous = {
      version: 1 as const,
      refreshedAt: 1,
      vods: [vod(1, "a"), vod(2, "k"), vod(3, "removed")],
      failures: [{ channelId: "k", kind: "network" as const }, { channelId: "removed", kind: "network" as const }],
      startedAt: 1,
      completedAt: 1,
    };
    readVodSnapshot.mockResolvedValue(previous);
    getParticipantVods.mockResolvedValue({ vods: [vod(1, "a"), vod(2, "k")], failures: [], attemptedChannelCount: 1 });

    const snapshot = await refreshVodSnapshot(1, participants);

    expect(getParticipantVods).toHaveBeenCalledWith({ channelIds: ["k"], existingVods: [vod(1, "a"), vod(2, "k")] }, participants);
    expect(snapshot.vods).toEqual([vod(1, "a"), vod(2, "k")]);
    expect(snapshot.failures).toEqual([]);
  });

  it("keeps a failed batch channel's previous VOD while merging successful channels", async () => {
    const participants = Array.from({ length: 10 }, (_, index) => participant(String.fromCharCode(97 + index)));
    const previous = {
      version: 1 as const,
      refreshedAt: 1,
      vods: [vod(1, "a"), vod(2, "b")],
      failures: [],
      startedAt: 1,
      completedAt: 1,
    };
    readVodSnapshot.mockResolvedValue(previous);
    getParticipantVods.mockResolvedValue({
      vods: [vod(3, "a"), vod(2, "b")],
      failures: [{ channelId: "b", kind: "network" }],
      attemptedChannelCount: 10,
    });

    const snapshot = await refreshVodSnapshot(0, participants);

    expect(snapshot.vods).toEqual([vod(3, "a"), vod(2, "b")]);
    expect(snapshot.failures).toEqual([{ channelId: "b", kind: "network" }]);
  });
});
