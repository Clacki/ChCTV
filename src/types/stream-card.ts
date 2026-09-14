/** UI data for discovery cards; independent of participant metadata and live API responses. */
export type StreamCardData = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  channelImageUrl: string;
  isLive: boolean;
  viewerCount: number;
  streamerName: string;
  rpName: string | null;
  channelId: string | null;
  category: string;
  tags: string[];
  aliases: string[];
};
