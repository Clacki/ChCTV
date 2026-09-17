import type {
  AmbiguousLiveMatch,
  BroadcastDiscoveryResult,
  ChzzkLiveChannel,
  ParticipantBroadcast,
} from "../types/participant-broadcast";
import type { Participant } from "../types/participant";

export type ParticipantLiveMergeResult = {
  broadcasts: ParticipantBroadcast[];
  ambiguousMatches: AmbiguousLiveMatch[];
};

export function normalizeChannelName(value: string): string {
  return value.trim().replaceAll(/\s+/g, "").toLocaleLowerCase("ko-KR");
}

export function mergeParticipantsWithLives(
  participants: readonly Participant[],
  lives: readonly ChzzkLiveChannel[],
): ParticipantLiveMergeResult {
  const liveByChannelId = new Map(lives.map((live) => [live.channelId, live]));
  const directMatches = new Map<number, ChzzkLiveChannel>();
  const matchedChannelIds = new Set<string>();

  participants.forEach((participant, participantIndex) => {
    if (!participant.channelId) {
      return;
    }

    const live = liveByChannelId.get(participant.channelId);

    if (live) {
      directMatches.set(participantIndex, live);
      matchedChannelIds.add(live.channelId);
    }
  });

  const participantIndexesByNormalizedName = new Map<string, number[]>();

  participants.forEach((participant, participantIndex) => {
    if (directMatches.has(participantIndex)) {
      return;
    }

    for (const name of new Set([participant.streamerName, ...participant.aliases])) {
      const normalizedName = normalizeChannelName(name);
      const indexes = participantIndexesByNormalizedName.get(normalizedName) ?? [];
      indexes.push(participantIndex);
      participantIndexesByNormalizedName.set(normalizedName, indexes);
    }
  });

  const candidateLivesByParticipantIndex = new Map<number, ChzzkLiveChannel[]>();
  const candidateParticipantIndexesByLiveId = new Map<string, number[]>();

  lives.forEach((live) => {
    if (matchedChannelIds.has(live.channelId)) {
      return;
    }

    const candidateIndexes = participantIndexesByNormalizedName.get(normalizeChannelName(live.channelName)) ?? [];

    if (candidateIndexes.length === 0) {
      return;
    }

    candidateParticipantIndexesByLiveId.set(live.channelId, candidateIndexes);

    for (const participantIndex of candidateIndexes) {
      const candidateLives = candidateLivesByParticipantIndex.get(participantIndex) ?? [];
      candidateLives.push(live);
      candidateLivesByParticipantIndex.set(participantIndex, candidateLives);
    }
  });

  const nameMatches = new Map<number, ChzzkLiveChannel>();
  const ambiguousMatches: AmbiguousLiveMatch[] = [];

  for (const [channelId, participantIndexes] of candidateParticipantIndexesByLiveId) {
    const live = liveByChannelId.get(channelId)!;
    const hasSingleCandidate = participantIndexes.length === 1;
    const [participantIndex] = participantIndexes;
    const participantHasSingleLiveCandidate = candidateLivesByParticipantIndex.get(participantIndex)?.length === 1;

    if (hasSingleCandidate && participantHasSingleLiveCandidate) {
      nameMatches.set(participantIndex, live);
      continue;
    }

    ambiguousMatches.push({
      channelId: live.channelId,
      channelName: live.channelName,
      participantNames: participantIndexes.map((participantIndex) => participants[participantIndex].streamerName),
    });
  }

  return {
    broadcasts: participants.map((participant, participantIndex) => {
      const live = directMatches.get(participantIndex) ?? nameMatches.get(participantIndex) ?? null;

      return {
        participant,
        isLive: live !== null,
        live,
        isRising: false,
        risingIncrease: null,
        risingRate: null,
        risingSortValue: null,
      };
    }),
    ambiguousMatches,
  };
}

/**
 * Keeps cached LIVE state while replacing participant metadata with the current catalog.
 * The cache intentionally outlives catalog edits, so metadata must not be served from
 * an older broadcast snapshot.
 */
export function refreshParticipantBroadcastMetadata(
  broadcasts: readonly ParticipantBroadcast[],
  participants: readonly Participant[],
): ParticipantBroadcast[] {
  const participantsByChannelId = new Map(
    participants.flatMap((participant) => participant.channelId ? [[participant.channelId, participant] as const] : []),
  );

  return broadcasts.map((broadcast) => {
    const participant = broadcast.participant.channelId
      ? participantsByChannelId.get(broadcast.participant.channelId)
      : undefined;

    return participant ? { ...broadcast, participant } : broadcast;
  });
}

export function sortParticipantBroadcasts(
  broadcasts: readonly ParticipantBroadcast[],
): ParticipantBroadcast[] {
  return [...broadcasts].sort((left, right) => {
    if (left.isLive !== right.isLive) {
      return left.isLive ? -1 : 1;
    }

    return (right.live?.viewerCount ?? 0) - (left.live?.viewerCount ?? 0);
  });
}

export function createBroadcastDiscoveryError(
  participants: readonly Participant[],
  error: Extract<BroadcastDiscoveryResult, { status: "error" }>["error"],
): BroadcastDiscoveryResult {
  return { status: "error", participants, error };
}
