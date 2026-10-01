import type { Participant } from "@/types/participant";
import type { Vod } from "@/types/vod";

export type VodListItem = {
  videoNo: number;
  channelId: string;
  title: string;
  thumbnailUrl: string | null;
  publishedAt: string;
  duration: number | null;
  url: string;
  participant: {
    name: string;
    channelId: string;
    affiliations: string[];
  } | null;
};

export type VodListResponse = {
  items: VodListItem[];
  total: number;
};

export function createVodListResponse(vods: readonly Vod[], participants: readonly Participant[]): VodListResponse {
  const participantsByChannelId = new Map(participants.flatMap((participant) => participant.channelId ? [[participant.channelId, participant] as const] : []));
  const items = [...vods]
    .sort((left, right) => right.publishedAt - left.publishedAt || right.videoNo - left.videoNo)
    .map((vod) => {
      const participant = participantsByChannelId.get(vod.channelId) ?? null;

      return {
        videoNo: vod.videoNo,
        channelId: vod.channelId,
        title: vod.title,
        thumbnailUrl: vod.thumbnailUrl,
        publishedAt: new Date(vod.publishedAt).toISOString(),
        duration: vod.duration,
        url: vod.url,
        participant: participant ? {
          name: participant.streamerName,
          channelId: participant.channelId!,
          affiliations: participant.affiliations.map((affiliation) => affiliation.name).slice(0, 3),
        } : null,
      };
    });

  return { items, total: items.length };
}
