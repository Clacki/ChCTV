import participantData from "../data/participants.json";
import type { Participant, ParticipantFilters } from "../types/participant";

const participants: readonly Participant[] = participantData;

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function includesAny(values: readonly string[], selectedValues: readonly string[]): boolean {
  const selected = new Set(selectedValues.filter(Boolean).map(normalize));

  return values.some((value) => selected.has(normalize(value)));
}

/** Returns the complete static participant catalog. Treat the result as read-only. */
export function getParticipants(): readonly Participant[] {
  return participants;
}

/** Searches the names that users use to find a participant. */
export function searchParticipants(query: string): Participant[] {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [...participants];
  }

  return participants.filter((participant) => {
    const searchableValues = [participant.streamerName, participant.rpName, ...participant.aliases];

    return searchableValues.some(
      (value) => value !== null && value !== undefined && normalize(value).includes(normalizedQuery),
    );
  });
}

/**
 * Matches OR within each facet and AND across affiliation, group, and tag facets.
 */
export function matchesParticipantFilters(participant: Participant, filters: ParticipantFilters): boolean {
  const affiliations = filters.affiliations?.filter(Boolean) ?? [];
  const groups = filters.groups?.filter(Boolean) ?? [];
  const tags = filters.tags?.filter(Boolean) ?? [];

  return (
    (affiliations.length === 0 || includesAny(participant.affiliations.map((affiliation) => affiliation.name), affiliations)) &&
    (groups.length === 0 || includesAny(participant.groups, groups)) &&
    (tags.length === 0 || includesAny(participant.tags, tags))
  );
}

export function filterParticipants(filters: ParticipantFilters): Participant[] {
  return participants.filter((participant) => matchesParticipantFilters(participant, filters));
}
