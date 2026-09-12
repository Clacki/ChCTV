import { describe, expect, it } from "vitest";

import {
  filterParticipants,
  getParticipants,
  searchParticipants,
} from "../src/lib/participants";

describe("participant catalog", () => {
  it("exposes the confirmed participant data", () => {
    expect(getParticipants()).toContainEqual({
      streamerName: "달콤레나",
      rpName: "종조이",
      channelId: null,
      jobs: ["공무직"],
      organization: {
        name: "교통정비공사",
        shortName: "교정공",
      },
      groups: [],
      aliases: [],
    });
  });

  it.each(["달콤레나", "종조이", "공무직", "교통정비공사", "교정공"])(
    "searches every discovery field: %s",
    (query) => {
      expect(searchParticipants(query)).toContainEqual(
        expect.objectContaining({ streamerName: "달콤레나" }),
      );
    },
  );

  it("filters by both formal and short organization names", () => {
    expect(filterParticipants({ organizationNames: ["교통정비공사"] })).toHaveLength(11);
    expect(filterParticipants({ organizationNames: ["교정공"] })).toHaveLength(11);
  });

  it("matches the source data totals and classification rules", () => {
    const participants = getParticipants();
    const countByJob = (job: string) => participants.filter((participant) => participant.jobs.includes(job)).length;
    const countByOrganization = (organizationName: string | null) =>
      participants.filter((participant) => (participant.organization?.name ?? null) === organizationName).length;

    expect(participants).toHaveLength(210);
    expect(participants.filter((participant) => participant.rpName !== null)).toHaveLength(53);
    expect(participants.filter((participant) => participant.rpName === null)).toHaveLength(157);
    expect(participants.filter((participant) => participant.channelId !== null)).toHaveLength(26);
    expect(countByJob("시장")).toBe(1);
    expect(countByJob("경찰")).toBe(16);
    expect(countByJob("의료")).toBe(16);
    expect(countByJob("언론")).toBe(10);
    expect(countByJob("공무직")).toBe(11);
    expect(countByJob("시민")).toBe(156);
    expect(countByOrganization("시청")).toBe(1);
    expect(countByOrganization("봉누도경찰청")).toBe(16);
    expect(countByOrganization("병원")).toBe(16);
    expect(countByOrganization("봉누도방송국")).toBe(10);
    expect(countByOrganization("교통정비공사")).toBe(11);
    expect(countByOrganization(null)).toBe(156);
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
    expect(participants.every((participant) => Array.isArray(participant.groups))).toBe(true);
    expect(participants.every((participant) => Array.isArray(participant.aliases))).toBe(true);
    expect(
      participants.every(
        (participant) =>
          participant.organization === null ||
          Boolean(participant.organization.name && participant.organization.shortName),
      ),
    ).toBe(true);
  });
});
