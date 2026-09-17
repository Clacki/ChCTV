import { describe, expect, it } from "vitest";

import { toDiscoveryMembers, toDiscoveryStreamCards } from "../src/features/discovery/participant-broadcast-adapter";
import { matchesParticipantFilters, getParticipants } from "../src/lib/participants";
import type { ParticipantBroadcast } from "../src/types/participant-broadcast";

const broadcasts: ParticipantBroadcast[] = [
  {
    participant: {
      streamerName: "테스트 스트리머",
      rpName: "테스트 RP",
      channelId: null,
      affiliations: [
        { type: "public", name: "교통정비공사", role: "기사" },
        { type: "public", name: "시민" },
        { type: "business", name: "플라네타" },
        { type: "business", name: "   " },
      ],
      groups: ["플라네타", "인챈트", ""],
      tags: ["버튜버"],
      aliases: ["테스트"],
    },
    isLive: true,
    isRising: true,
    risingIncrease: 24,
    risingRate: 0.2,
    risingSortValue: 24,
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
    isRising: false,
    risingIncrease: null,
    risingRate: null,
    risingSortValue: null,
    live: null,
    channelImageUrl: "https://cdn.example.com/offline-channel.jpg",
  },
];

describe("toDiscoveryStreamCards", () => {
  it("derives display groups from participant groups and affiliations", () => {
    const [stream] = toDiscoveryStreamCards(broadcasts);

    expect(stream).toEqual(expect.objectContaining({
      id: "channel:29f20622463916fa48ad735057b145ce",
      channelId: "29f20622463916fa48ad735057b145ce",
      title: "실제 LIVE 제목",
      viewerCount: 123,
      isLive: true,
      isRising: true,
      risingIncrease: 24,
      risingSortValue: 24,
      thumbnailUrl: "https://cdn.example.com/live.jpg",
      channelImageUrl: "https://cdn.example.com/channel.jpg",
      category: "GTA V",
      displayGroups: ["플라네타", "인챈트", "교통정비공사"],
    }));
    expect(stream.displayGroups).not.toContain("시민");
    expect(stream.displayGroups).not.toContain(stream.tags[0]);
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
      displayGroups: ["플라네타", "인챈트", "교통정비공사"],
    }));
  });

  it("keeps offline participants separate from channelId-matched live streams", () => {
    expect(toDiscoveryMembers(broadcasts)).toEqual([
      expect.objectContaining({ status: "LIVE", participant: broadcasts[0].participant }),
      expect.objectContaining({ status: "OFFLINE", participant: broadcasts[1].participant, channelImageUrl: "https://cdn.example.com/offline-channel.jpg" }),
    ]);
  });

  it("keeps catalog groups available to both LIVE cards and group filters", () => {
    const participantNames = ["루루엘 아스트리온", "시아 이르엘린"];
    const catalogParticipants = getParticipants().filter((participant) => participantNames.includes(participant.streamerName));
    const liveBroadcasts: ParticipantBroadcast[] = catalogParticipants.map((participant) => ({
      participant,
      isLive: true,
      live: {
        channelId: participant.channelId!,
        channelName: participant.streamerName,
        liveTitle: `${participant.streamerName} 방송`,
        viewerCount: 1,
        thumbnailUrl: null,
        channelImageUrl: null,
        tags: [],
        categoryType: null,
        liveCategory: null,
        liveCategoryValue: null,
      },
    }));

    const members = toDiscoveryMembers(liveBroadcasts);

    expect(members).toHaveLength(2);
    for (const group of ["베이라이트", "샌드박스"]) {
      expect(members.every((member) => matchesParticipantFilters(member.participant, { groups: [group] }))).toBe(true);
      expect(members.every((member) => member.status === "LIVE" && member.stream.displayGroups.includes(group))).toBe(true);
    }
  });
});
