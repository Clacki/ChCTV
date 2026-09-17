import "server-only";

import { getParticipants } from "../../lib/participants";
import { createBroadcastDiscoveryError, mergeParticipantsWithLives } from "../../lib/participant-broadcasts";
import type { BroadcastDiscoveryResult } from "../../types/participant-broadcast";
import { getCachedChzzkChannelImages } from "./channel-metadata-cache";
import { ChzzkApiError, getCurrentChzzkLives } from "./client";

export async function getParticipantBroadcasts(): Promise<BroadcastDiscoveryResult> {
  const participants = getParticipants();

  try {
    const lives = await getCurrentChzzkLives();
    let channelImages = new Map<string, string>();

    try {
      channelImages = await getCachedChzzkChannelImages(participants.flatMap((participant) => participant.channelId ? [participant.channelId] : []));
    } catch {
      // Keep the LIVE discovery response available when optional roster avatars cannot be refreshed.
    }

    const { broadcasts, ambiguousMatches } = mergeParticipantsWithLives(participants, lives);

    const broadcastsWithChannelImages = broadcasts.map((broadcast) => ({
      ...broadcast,
      channelImageUrl: broadcast.live?.channelImageUrl ?? (broadcast.participant.channelId ? channelImages.get(broadcast.participant.channelId) ?? null : null),
    }));

    return { status: "success", broadcasts: broadcastsWithChannelImages, ambiguousMatches };
  } catch (error) {
    if (error instanceof ChzzkApiError) {
      return createBroadcastDiscoveryError(participants, error.kind);
    }

    return createBroadcastDiscoveryError(participants, "upstream");
  }
}
