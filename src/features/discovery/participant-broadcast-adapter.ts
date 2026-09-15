import type { StreamCardData } from "@/types/stream-card";
import type { ParticipantBroadcast } from "@/types/participant-broadcast";
import type { Participant } from "@/types/participant";

export type DiscoveryMember =
  | { status: "LIVE"; participant: Participant; stream: StreamCardData }
  | { status: "OFFLINE"; participant: Participant; channelImageUrl: string | null };

function getDisplayGroups(broadcast: ParticipantBroadcast): string[] {
  return [...new Set([
    ...broadcast.participant.groups,
    ...broadcast.participant.affiliations.map((affiliation) => affiliation.name),
  ].map((value) => value.trim()).filter((value) => value.length > 0 && value !== "시민"))];
}

function toDiscoveryStreamCard(broadcast: ParticipantBroadcast): StreamCardData | null {
    if (!broadcast.isLive || !broadcast.live) {
      return null;
    }

    return {
      id: `channel:${broadcast.live.channelId}`,
      title: broadcast.live.liveTitle,
      thumbnailUrl: broadcast.live.thumbnailUrl,
      channelImageUrl: broadcast.live.channelImageUrl,
      isLive: true,
      viewerCount: broadcast.live.viewerCount,
      streamerName: broadcast.participant.streamerName,
      rpName: broadcast.participant.rpName,
      channelId: broadcast.live.channelId,
      category: broadcast.live.liveCategoryValue ?? broadcast.live.liveCategory,
      tags: broadcast.participant.tags,
      displayGroups: getDisplayGroups(broadcast),
      aliases: broadcast.participant.aliases,
    };
}

/** Keeps the server's channelId-based live match distinct from offline roster data. */
export function toDiscoveryMembers(broadcasts: readonly ParticipantBroadcast[]): DiscoveryMember[] {
  return broadcasts.map((broadcast) => {
    const stream = toDiscoveryStreamCard(broadcast);

    return stream
      ? { status: "LIVE", participant: broadcast.participant, stream }
      : { status: "OFFLINE", participant: broadcast.participant, channelImageUrl: broadcast.channelImageUrl ?? null };
  });
}

export function toDiscoveryStreamCards(broadcasts: readonly ParticipantBroadcast[]): StreamCardData[] {
  return toDiscoveryMembers(broadcasts).flatMap((member) => member.status === "LIVE" ? [member.stream] : []);
}
