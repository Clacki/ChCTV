import { describe, expect, it } from "vitest";

import {
  createBroadcastDiscoveryError,
  mergeParticipantsWithLives,
  normalizeChannelName,
  sortParticipantBroadcasts,
} from "../src/lib/participant-broadcasts";
import type { Participant } from "../src/types/participant";
import type { ChzzkLiveChannel } from "../src/types/participant-broadcast";

const participant = (overrides: Partial<Participant> = {}): Participant => ({
  streamerName: "달콤레나",
  rpName: null,
  channelId: null,
  affiliations: [],
  groups: [],
  tags: [],
  aliases: [],
  ...overrides,
});

const live = (overrides: Partial<ChzzkLiveChannel> = {}): ChzzkLiveChannel => ({
  channelId: "a".repeat(32),
  channelName: "달콤레나",
  liveTitle: "라이브",
  viewerCount: 100,
  thumbnailUrl: null,
  channelImageUrl: null,
  tags: [],
  categoryType: null,
  liveCategory: null,
  liveCategoryValue: null,
  ...overrides,
});

describe("participant live matching", () => {
  it("prioritizes a channel ID match even when the channel name changed", () => {
    const channelId = "b".repeat(32);
    const result = mergeParticipantsWithLives(
      [participant({ channelId })],
      [live({ channelId, channelName: "새 채널명" })],
    );

    expect(result.broadcasts[0]).toMatchObject({ isLive: true, live: { channelId } });
  });

  it("matches an unknown channel ID by an exact normalized streamer name", () => {
    const result = mergeParticipantsWithLives(
      [participant({ streamerName: "버찌 BUZZI" })],
      [live({ channelName: "버찌BUZZI" })],
    );

    expect(result.broadcasts[0].live?.channelId).toBe("a".repeat(32));
  });

  it("does not match partial or fuzzy channel names", () => {
    const result = mergeParticipantsWithLives([participant()], [live({ channelName: "달콤레나 다시보기" })]);

    expect(result.broadcasts[0]).toMatchObject({ isLive: false, live: null });
  });

  it("keeps participants offline when no live channel matches", () => {
    const result = mergeParticipantsWithLives([participant()], [live({ channelName: "다른 방송" })]);

    expect(result.broadcasts[0].isLive).toBe(false);
  });

  it("does not automatically match a live channel shared by multiple participants", () => {
    const result = mergeParticipantsWithLives(
      [participant(), participant({ streamerName: "달콤 레나" })],
      [live()],
    );

    expect(result.broadcasts.every((broadcast) => !broadcast.isLive)).toBe(true);
    expect(result.ambiguousMatches).toEqual([
      expect.objectContaining({ participantNames: ["달콤레나", "달콤 레나"] }),
    ]);
  });

  it("supports aliases and sorts live broadcasts by viewer count before offline participants", () => {
    const result = mergeParticipantsWithLives(
      [
        participant({ streamerName: "첫 번째", aliases: ["별칭"] }),
        participant({ streamerName: "두 번째" }),
      ],
      [live({ channelName: "별칭", viewerCount: 10 })],
    );

    expect(sortParticipantBroadcasts([...result.broadcasts].reverse()).map((broadcast) => broadcast.participant.streamerName)).toEqual([
      "첫 번째",
      "두 번째",
    ]);
  });

  it("normalizes only whitespace and letter casing", () => {
    expect(normalizeChannelName("  BuzzI  ")).toBe("buzzi");
    expect(normalizeChannelName("버찌 BUZZI")).toBe(normalizeChannelName("버찌BUZZI"));
  });

  it("keeps API failures distinct from an all-offline result", () => {
    const participants = [participant()];
    const result = createBroadcastDiscoveryError(participants, "network");

    expect(result).toEqual({ status: "error", participants, error: "network" });
  });
});
