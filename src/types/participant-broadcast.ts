import type { Participant } from "./participant";

export type ChzzkLiveChannel = {
  channelId: string;
  channelName: string;
  liveTitle: string;
  viewerCount: number;
  thumbnailUrl: string | null;
};

export type ParticipantBroadcast = {
  participant: Participant;
  isLive: boolean;
  live: ChzzkLiveChannel | null;
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
    }
  | {
      status: "error";
      participants: readonly Participant[];
      error: "configuration" | "authentication" | "rate_limit" | "upstream" | "network";
    };

export type ParticipantBroadcastSnapshot = {
  broadcasts: ParticipantBroadcast[];
  ambiguousMatches: AmbiguousLiveMatch[];
  fetchedAt: string;
};

export type CachedParticipantBroadcastsResult =
  | ({ status: "fresh" | "stale"; cacheAgeSeconds: number } & ParticipantBroadcastSnapshot)
  | {
      status: "error";
      participants: readonly Participant[];
      error: "configuration" | "authentication" | "rate_limit" | "upstream" | "network";
    };
