import "server-only";

import {
  BONGNUDO_VOD_CATEGORY_VALUE,
  BONGNUDO_VOD_COLLECTION_END_AT,
  BONGNUDO_VOD_START_AT,
  isBongnudoVodPublishedAt,
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
  attemptedChannelCount: number;
};

export type ParticipantVodOptions = {
  startAt?: number;
  endAt?: number;
  channelIds?: readonly string[];
  existingVods?: readonly Vod[];
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
  { startAt = BONGNUDO_VOD_START_AT, endAt = BONGNUDO_VOD_COLLECTION_END_AT, channelIds, existingVods = [] }: ParticipantVodOptions,
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
  const vodsByVideoNo = new Map(existingVods
    .filter((vod) =>
      vod.videoType === "REPLAY"
      && vod.videoCategoryValue === BONGNUDO_VOD_CATEGORY_VALUE
      && isBongnudoVodPublishedAt(vod.publishedAt, startAt, endAt),
    )
    .map((vod) => [vod.videoNo, vod]));
  const failures: ParticipantVodFailure[] = [];

  results.forEach((result, index) => {
    const channelId = participantChannelIds[index];

    if (result.status === "fulfilled") {
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

  return { vods: [...vodsByVideoNo.values()], failures, attemptedChannelCount: participantChannelIds.length };
}
