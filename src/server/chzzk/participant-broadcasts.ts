import "server-only";

import { getParticipants } from "../../lib/participants";
import { createBroadcastDiscoveryError, mergeParticipantsWithLives } from "../../lib/participant-broadcasts";
import type { BroadcastDiscoveryResult } from "../../types/participant-broadcast";
import { ChzzkApiError, getCurrentChzzkLives } from "./client";

export async function getParticipantBroadcasts(): Promise<BroadcastDiscoveryResult> {
  const participants = getParticipants();

  try {
    const lives = await getCurrentChzzkLives();
    const { broadcasts, ambiguousMatches } = mergeParticipantsWithLives(participants, lives);

    return { status: "success", broadcasts, ambiguousMatches };
  } catch (error) {
    if (error instanceof ChzzkApiError) {
      return createBroadcastDiscoveryError(participants, error.kind);
    }

    return createBroadcastDiscoveryError(participants, "upstream");
  }
}
