import "server-only";

import {
  BONGNUDO_VOD_COLLECTION_END_AT,
  BONGNUDO_VOD_START_AT,
} from "@/lib/bongnudo-vod";
import { getParticipants } from "@/lib/participants";
import type { Participant } from "@/types/participant";
import type { Vod } from "@/types/vod";

import { ChzzkVodApiError, getChzzkChannelVods } from "./vod-client";

export type ParticipantVodFailure = {
  channelId: string;
  kind: ChzzkVodApiError["kind"] | "unknown";
  status?: number;
};

export type ParticipantVodCollection = {
  vods: Vod[];
  failures: ParticipantVodFailure[];
  successfulChannelIds: string[];
  attemptedChannelCount: number;
};

export type ParticipantVodOptions = {
  startAt?: number;
  endAt?: number;
  channelIds?: readonly string[];
};

const channelConcurrency = 5;

type ChannelVodLoader = (channelId: string, startAt: number, endAt: number) => Promise<Vod[]>;

async function collectChannelVods(
  channelIds: readonly string[],
  startAt: number,
  endAt: number,
  loadChannelVods: ChannelVodLoader,
): Promise<Array<PromiseSettledResult<Vod[]>>> {
  const results: Array<PromiseSettledResult<Vod[]>> = Array.from({ length: channelIds.length });
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < channelIds.length) {
      const index = nextIndex++;
      const channelId = channelIds[index];
      try {
        results[index] = { status: "fulfilled", value: await loadChannelVods(channelId, startAt, endAt) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(channelConcurrency, channelIds.length) }, () => worker()));
  return results;
}

export async function getParticipantVods(
  { startAt = BONGNUDO_VOD_START_AT, endAt = BONGNUDO_VOD_COLLECTION_END_AT, channelIds }: ParticipantVodOptions,
  participants: readonly Participant[] = getParticipants(),
  loadChannelVods: ChannelVodLoader = getChzzkChannelVods,
): Promise<ParticipantVodCollection> {
  const requestedChannelIds = channelIds ? new Set(channelIds) : null;
  const participantChannelIds = [
    ...new Set(
      participants
        .flatMap((participant) => (participant.channelId ? [participant.channelId] : []))
        .filter((channelId) => requestedChannelIds === null || requestedChannelIds.has(channelId)),
    ),
  ];
  const results = await collectChannelVods(participantChannelIds, startAt, endAt, loadChannelVods);
  const vodsByVideoNo = new Map<number, Vod>();
  const failures: ParticipantVodFailure[] = [];
  const successfulChannelIds: string[] = [];

  results.forEach((result, index) => {
    const channelId = participantChannelIds[index];

    if (result.status === "fulfilled") {
      successfulChannelIds.push(channelId);
      result.value.forEach((vod) => vodsByVideoNo.set(vod.videoNo, vod));
      return;
    }

    const error = result.reason;
    failures.push(
      error instanceof ChzzkVodApiError
        ? { channelId, kind: error.kind, ...(error.status ? { status: error.status } : {}) }
        : { channelId, kind: "unknown" },
    );
  });

  return { vods: [...vodsByVideoNo.values()], failures, successfulChannelIds, attemptedChannelCount: participantChannelIds.length };
}
