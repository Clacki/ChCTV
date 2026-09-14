import type { Participant } from "./participant";

/** UI data for discovery cards; independent of the streaming API response. */
export type StreamCardData = Participant & {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  channelImageUrl: string;
  isLive: boolean;
  viewerCount: number;
  category: string;
  tags: string[];
};
