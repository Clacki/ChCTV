import { describe, expect, it } from "vitest";

import participantData from "../src/data/participants.json";
import {
  filterParticipants,
  getParticipants,
  isParticipantAffiliationType,
  matchesParticipantFilters,
  searchParticipants,
} from "../src/lib/participants";
import { participantAffiliationTypes } from "../src/types/participant";

describe("participant catalog", () => {
  it("returns the complete current source catalog without changing participant metadata", () => {
    expect(getParticipants()).toEqual(participantData);
    expect(filterParticipants({})).toEqual(participantData);
  });

  it("accepts all five affiliation types present in the source data", () => {
    const sourceTypes = new Set(participantData.flatMap((participant) => participant.affiliations.map((affiliation) => affiliation.type)));

    expect(sourceTypes).toEqual(new Set(participantAffiliationTypes));
    expect(participantData.every((participant) =>
      participant.affiliations.every((affiliation) => isParticipantAffiliationType(affiliation.type)),
    )).toBe(true);
  });

  it("filters each affiliation type by its source affiliation name", () => {
    for (const type of participantAffiliationTypes) {
      const affiliation = participantData.flatMap((participant) => participant.affiliations)
        .find((item) => item.type === type);

      expect(affiliation).toBeDefined();
      const filtered = filterParticipants({ affiliations: [affiliation!.name] });

      expect(filtered).not.toHaveLength(0);
      expect(filtered.every((participant) => participant.affiliations.some((item) =>
        item.type === type && item.name === affiliation!.name,
      ))).toBe(true);
    }
  });

  it("keeps participants without affiliations in the unfiltered list", () => {
    const withoutAffiliation = participantData.filter((participant) => participant.affiliations.length === 0);

    expect(withoutAffiliation.length).toBeGreaterThan(0);
    expect(getParticipants()).toEqual(expect.arrayContaining(withoutAffiliation));
  });

  it("keeps affiliation OR semantics and ANDs affiliation filters with group and tag filters", () => {
    const participant = {
      streamerName: "multiple facets",
      rpName: null,
      channelId: null,
      affiliations: [
        { type: "gang" as const, name: "gang affiliation" },
        { type: "business" as const, name: "business affiliation" },
      ],
      groups: ["group"],
      tags: ["tag"],
      aliases: [],
    };

    expect(matchesParticipantFilters(participant, { affiliations: ["gang affiliation", "business affiliation"] })).toBe(true);
    expect(matchesParticipantFilters(participant, { affiliations: ["gang affiliation"], groups: ["group"], tags: ["tag"] })).toBe(true);
    expect(matchesParticipantFilters(participant, { affiliations: ["gang affiliation"], groups: ["other group"] })).toBe(false);
  });

  it("searches a current participant's streamer name, RP name, and aliases", () => {
    const participant = participantData.find((item) => item.rpName && item.aliases.length > 0);

    expect(participant).toBeDefined();
    for (const value of [participant!.streamerName, participant!.rpName!, participant!.aliases[0]]) {
      expect(searchParticipants(value)).toContainEqual(expect.objectContaining({ streamerName: participant!.streamerName }));
    }
  });

  it("has unique valid participant identifiers and does not duplicate affiliation data in tags", () => {
    const participants = getParticipants();
    const streamerNames = participants.map((participant) => participant.streamerName);
    const channelIds = participants.map((participant) => participant.channelId).filter((channelId): channelId is string => channelId !== null);

    expect(new Set(streamerNames)).toHaveLength(streamerNames.length);
    expect(new Set(channelIds)).toHaveLength(channelIds.length);
    expect(channelIds.every((channelId) => /^[0-9a-f]{32}$/.test(channelId))).toBe(true);
    expect(participants.every((participant) => participant.tags.every((tag) =>
      !participant.affiliations.some((affiliation) => affiliation.name === tag),
    ))).toBe(true);
  });
});
