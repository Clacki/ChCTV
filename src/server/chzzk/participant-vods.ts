import "server-only";

import { BONGNUDO_VOD_START_AT } from "@/lib/bongnudo-vod";
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
};

export type ParticipantVodOptions = {
  startAt?: number;
  channelIds?: readonly string[];
  existingVods?: readonly Vod[];
};

const channelConcurrency = 5;

type ChannelVodLoader = (channelId: string, startAt: number, knownVideoNos: ReadonlySet<number>) => Promise<Vod[]>;

async function collectChannelVods(
  channelIds: readonly string[],
  startAt: number,
  existingVods: readonly Vod[],
  loadChannelVods: ChannelVodLoader,
): Promise<Array<PromiseSettledResult<Vod[]>>> {
  const results: Array<PromiseSettledResult<Vod[]>> = Array.from({ length: channelIds.length });
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < channelIds.length) {
      const index = nextIndex++;
      const channelId = channelIds[index];
      const knownVideoNos = new Set(existingVods.filter((vod) => vod.channelId === channelId).map((vod) => vod.videoNo));

      try {
        results[index] = { status: "fulfilled", value: await loadChannelVods(channelId, startAt, knownVideoNos) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(channelConcurrency, channelIds.length) }, () => worker()));
  return results;
}

export async function getParticipantVods(
  { startAt = BONGNUDO_VOD_START_AT, channelIds, existingVods = [] }: ParticipantVodOptions,
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
  const results = await collectChannelVods(participantChannelIds, startAt, existingVods, loadChannelVods);
  const vodsByVideoNo = new Map(existingVods.map((vod) => [vod.videoNo, vod]));
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

  return { vods: [...vodsByVideoNo.values()], failures };
}
