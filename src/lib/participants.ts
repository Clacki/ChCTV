import participantData from "../data/participants.json";
import type { Participant, ParticipantFilters } from "../types/participant";

const participants: readonly Participant[] = participantData;

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function includesAny(values: readonly string[], selectedValues: readonly string[]): boolean {
  const selected = new Set(selectedValues.map(normalize));

  return values.some((value) => selected.has(normalize(value)));
}

/** Returns the complete static participant catalog. Treat the result as read-only. */
export function getParticipants(): readonly Participant[] {
  return participants;
}

/** Searches all fields intended for participant discovery. */
export function searchParticipants(query: string): Participant[] {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [...participants];
  }

  return participants.filter((participant) => {
    const searchableValues = [
      participant.streamerName,
      participant.rpName,
      ...participant.aliases,
      ...participant.jobs,
      participant.organization?.name,
      participant.organization?.shortName,
      ...participant.groups,
    ];

    return searchableValues.some(
      (value) => value !== null && value !== undefined && normalize(value).includes(normalizedQuery),
    );
  });
}

/**
 * Applies OR matching within each filter and AND matching between filter types.
 * For organization filters, both the formal and short organization names match.
 */
export function filterParticipants(filters: ParticipantFilters): Participant[] {
  const jobs = filters.jobs?.filter(Boolean) ?? [];
  const organizationNames = filters.organizationNames?.filter(Boolean) ?? [];
  const groups = filters.groups?.filter(Boolean) ?? [];

  return participants.filter((participant) => {
    if (jobs.length > 0 && !includesAny(participant.jobs, jobs)) {
      return false;
    }

    if (
      organizationNames.length > 0 &&
      !participant.organization?.name &&
      !participant.organization?.shortName
    ) {
      return false;
    }

    if (
      organizationNames.length > 0 &&
      !includesAny(
        [participant.organization!.name, participant.organization!.shortName],
        organizationNames,
      )
    ) {
      return false;
    }

    return groups.length === 0 || includesAny(participant.groups, groups);
  });
}
