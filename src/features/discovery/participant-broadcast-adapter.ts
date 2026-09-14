import type { StreamCardData } from "@/types/stream-card";
import type { ParticipantBroadcast } from "@/types/participant-broadcast";

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
      aliases: broadcast.participant.aliases,
    }];
  });
}
