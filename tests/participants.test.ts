import { describe, expect, it } from "vitest";

import {
  filterParticipants,
  getParticipants,
  matchesParticipantFilters,
  searchParticipants,
} from "../src/lib/participants";

describe("participant catalog", () => {
  it("exposes the confirmed participant data", () => {
    expect(getParticipants()).toContainEqual({
      streamerName: "달콤레나",
      rpName: "종조이",
      channelId: "a67b328bcc8eea4451ccfa754bc19ae1",
      affiliations: [{ type: "public", name: "교통정비공사", role: "기사" }],
      groups: ["인챈트"],
      tags: [],
      aliases: ["죵쬐", "저그"],
    });
  });

  it.each(["달콤레나", "종조이", "죵쬐"])(
    "searches every discovery field: %s",
    (query) => {
      expect(searchParticipants(query)).toContainEqual(
        expect.objectContaining({ streamerName: "달콤레나" }),
      );
    },
  );

  it("filters by one affiliation or multiple affiliations within the same facet", () => {
    expect(filterParticipants({ affiliations: ["교통정비공사"] })).toHaveLength(11);
    expect(filterParticipants({ affiliations: ["봉누도경찰청", "병원"] })).toHaveLength(32);
  });

  it("combines affiliation, group, and tag facets with AND", () => {
    const participant = {
      streamerName: "복수 소속",
      rpName: null,
      channelId: null,
      affiliations: [
        { type: "gang", name: "백호파", role: "간부" },
        { type: "business", name: "봉누카페", role: "직원" },
      ],
      groups: ["스텔라이브"],
      tags: ["버튜버"],
      aliases: [],
    };

    expect(matchesParticipantFilters(participant, { affiliations: ["백호파", "봉누카페"] })).toBe(true);
    expect(matchesParticipantFilters(participant, { groups: ["스텔라이브"] })).toBe(true);
    expect(matchesParticipantFilters(participant, { tags: ["버튜버"] })).toBe(true);
    expect(matchesParticipantFilters(participant, { affiliations: ["백호파"], groups: ["스텔라이브"], tags: ["버튜버"] })).toBe(true);
    expect(matchesParticipantFilters(participant, { affiliations: ["백호파"], groups: ["다른그룹"] })).toBe(false);
  });

  it("applies search and facet filters together", () => {
    const matchingParticipants = searchParticipants("종조이").filter((participant) =>
      matchesParticipantFilters(participant, { affiliations: ["교통정비공사"] }),
    );

    expect(matchingParticipants).toContainEqual(
      expect.objectContaining({ streamerName: "달콤레나" }),
    );
  });

  it("matches the source data totals and classification rules", () => {
    const participants = getParticipants();
    const countByRole = (role: string) =>
      participants.filter((participant) => participant.affiliations.some((affiliation) => affiliation.role === role)).length;
    const countByAffiliation = (name: string) =>
      participants.filter((participant) => participant.affiliations.some((affiliation) => affiliation.name === name)).length;

    expect(participants).toHaveLength(220);
    expect(participants.filter((participant) => participant.rpName !== null)).toHaveLength(198);
    expect(participants.filter((participant) => participant.rpName === null)).toHaveLength(22);
    expect(participants.filter((participant) => participant.channelId !== null)).toHaveLength(220);
    expect(countByRole("시장")).toBe(1);
    expect(countByRole("경찰")).toBe(15);
    expect(countByRole("간호사")).toBe(15);
    expect(countByRole("기자")).toBe(9);
    expect(countByRole("기사")).toBe(10);
    expect(countByAffiliation("시청")).toBe(1);
    expect(countByAffiliation("봉누도경찰청")).toBe(16);
    expect(countByAffiliation("병원")).toBe(16);
    expect(countByAffiliation("봉누도방송국")).toBe(10);
    expect(countByAffiliation("교통정비공사")).toBe(11);
    expect(participants.filter((participant) => participant.affiliations.length === 0)).toHaveLength(166);
  });

  it("contains no invalid or duplicate participant identifiers", () => {
    const participants = getParticipants();
    const streamerNames = participants.map((participant) => participant.streamerName);
    const channelIds = participants
      .map((participant) => participant.channelId)
      .filter((channelId): channelId is string => channelId !== null);

    expect(streamerNames.every(Boolean)).toBe(true);
    expect(new Set(streamerNames)).toHaveLength(streamerNames.length);
    expect(new Set(channelIds)).toHaveLength(channelIds.length);
    expect(channelIds.every((channelId) => /^[0-9a-f]{32}$/.test(channelId))).toBe(true);
    expect(participants.every((participant) => participant.rpName !== "***")).toBe(true);
    expect(participants.every((participant) => Array.isArray(participant.aliases))).toBe(true);
    expect(participants.every((participant) => Array.isArray(participant.affiliations))).toBe(true);
    expect(participants.every((participant) => Array.isArray(participant.groups))).toBe(true);
    expect(participants.every((participant) => Array.isArray(participant.tags))).toBe(true);
    expect(participants.every((participant) => participant.affiliations.every((affiliation) => Boolean(affiliation.type && affiliation.name)))).toBe(true);
  });
});
