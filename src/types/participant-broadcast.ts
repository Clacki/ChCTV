import type { Participant } from "./participant";

export type ChzzkLiveChannel = {
  channelId: string;
  channelName: string;
  liveTitle: string;
  viewerCount: number;
  thumbnailUrl: string | null;
  channelImageUrl: string | null;
  tags: string[];
  categoryType: string | null;
  liveCategory: string | null;
  liveCategoryValue: string | null;
};

export type ParticipantBroadcast = {
  participant: Participant;
  isLive: boolean;
  live: ChzzkLiveChannel | null;
  channelImageUrl?: string | null;
  isRising: boolean;
  risingIncrease: number | null;
  risingRate: number | null;
  risingSortValue: number | null;
};

export type AmbiguousLiveMatch = {
  channelId: string;
  channelName: string;
  participantNames: string[];
};

export type BroadcastDiscoveryResult =
  | {
      status: "success";
      broadcasts: ParticipantBroadcast[];
      ambiguousMatches: AmbiguousLiveMatch[];
      risingHistoryReady: boolean;
    }
  | {
      status: "error";
      participants: readonly Participant[];
      error: "configuration" | "authentication" | "rate_limit" | "upstream" | "network";
    };

export type ParticipantBroadcastSnapshot = {
  broadcasts: ParticipantBroadcast[];
  ambiguousMatches: AmbiguousLiveMatch[];
  risingHistoryReady: boolean;
  fetchedAt: string;
};

export type CachedParticipantBroadcastsResult =
  | ({ status: "fresh" | "stale"; cacheAgeSeconds: number } & ParticipantBroadcastSnapshot)
  | {
      status: "error";
      participants: readonly Participant[];
      error: "configuration" | "authentication" | "rate_limit" | "upstream" | "network";
    };
