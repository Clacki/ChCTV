/** UI data for discovery cards; independent of participant metadata and live API responses. */
export type StreamCardData = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  channelImageUrl: string | null;
  isLive: boolean;
  viewerCount: number;
  streamerName: string;
  rpName: string | null;
  channelId: string | null;
  category: string | null;
  categoryKey?: string | null;
  tags: string[];
  displayGroups: string[];
  aliases: string[];
  isRising?: boolean;
  risingIncrease?: number | null;
  risingSortValue?: number | null;
};
