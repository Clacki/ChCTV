import type { StreamCardData } from "@/types/stream-card";
import type { ParticipantBroadcast } from "@/types/participant-broadcast";

function getDisplayGroups(broadcast: ParticipantBroadcast): string[] {
  return [...new Set([
    ...broadcast.participant.groups,
    ...broadcast.participant.affiliations.map((affiliation) => affiliation.name),
  ].map((value) => value.trim()).filter((value) => value.length > 0 && value !== "시민"))];
}

export function toDiscoveryStreamCards(broadcasts: readonly ParticipantBroadcast[]): StreamCardData[] {
  return broadcasts.flatMap((broadcast) => {
    if (!broadcast.isLive || !broadcast.live) {
      return [];
    }

    return [{
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
    }];
  });
}
