import { describe, expect, it } from "vitest";

import { toDiscoveryStreamCards } from "../src/features/discovery/participant-broadcast-adapter";
import type { ParticipantBroadcast } from "../src/types/participant-broadcast";

const broadcasts: ParticipantBroadcast[] = [
  {
    participant: {
      streamerName: "테스트 스트리머",
      rpName: "테스트 RP",
      channelId: null,
      affiliations: [],
      groups: [],
      tags: ["버튜버"],
      aliases: ["테스트"],
    },
    isLive: true,
    live: {
      channelId: "29f20622463916fa48ad735057b145ce",
      channelName: "테스트 채널",
      liveTitle: "실제 LIVE 제목",
      viewerCount: 123,
      thumbnailUrl: "https://cdn.example.com/live.jpg",
      channelImageUrl: "https://cdn.example.com/channel.jpg",
      tags: ["공식 태그"],
      categoryType: "GAME",
      liveCategory: "게임",
      liveCategoryValue: "GTA V",
    },
  },
  {
    participant: {
      streamerName: "오프라인",
      rpName: null,
      channelId: null,
      affiliations: [],
      groups: [],
      tags: [],
      aliases: [],
    },
    isLive: false,
    live: null,
  },
];

describe("toDiscoveryStreamCards", () => {
  it("uses Participant tags without changing CHZZK live field mappings", () => {
    const [stream] = toDiscoveryStreamCards(broadcasts);

    expect(stream).toEqual(expect.objectContaining({
      id: "channel:29f20622463916fa48ad735057b145ce",
      channelId: "29f20622463916fa48ad735057b145ce",
      title: "실제 LIVE 제목",
      viewerCount: 123,
      isLive: true,
      thumbnailUrl: "https://cdn.example.com/live.jpg",
      channelImageUrl: "https://cdn.example.com/channel.jpg",
      category: "GTA V",
      tags: ["버튜버"],
    }));
    expect(stream.tags).not.toContain("공식 태그");
  });

  it("keeps the CHZZK fallback category when liveCategoryValue is absent", () => {
    const [stream] = toDiscoveryStreamCards([
      {
        ...broadcasts[0],
        live: {
          ...broadcasts[0].live!,
          liveCategoryValue: null,
          liveCategory: "게임",
          tags: ["방송 태그"],
        },
      },
    ]);

    expect(stream).toEqual(expect.objectContaining({
      category: "게임",
      tags: ["버튜버"],
    }));
  });
});
