"use client";

import { useEffect, useState } from "react";

import { toDiscoveryStreamCards } from "@/features/discovery/participant-broadcast-adapter";
import type { Participant } from "@/types/participant";
import type { CachedParticipantBroadcastsResult } from "@/types/participant-broadcast";
import type { StreamCardData } from "@/types/stream-card";

type ParticipantBroadcastState =
  | { status: "loading"; streams: readonly StreamCardData[]; participants: readonly Participant[] }
  | { status: "success"; streams: readonly StreamCardData[]; participants: readonly Participant[] }
  | { status: "error"; streams: readonly StreamCardData[]; participants: readonly Participant[] };

const initialState: ParticipantBroadcastState = { status: "loading", streams: [], participants: [] };

export function useParticipantBroadcasts() {
  const [state, setState] = useState<ParticipantBroadcastState>(initialState);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch("/api/chzzk/participant-broadcasts", { signal: controller.signal });
        const result = await response.json() as CachedParticipantBroadcastsResult;

        if (!response.ok || result.status === "error") {
          throw new Error("Failed to load participant broadcasts");
        }

        const liveBroadcasts = result.broadcasts.filter((broadcast) => broadcast.isLive && broadcast.live !== null);
        setState({
          status: "success",
          streams: toDiscoveryStreamCards(liveBroadcasts),
          participants: liveBroadcasts.map((broadcast) => broadcast.participant),
        });
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") {
          setState({ status: "error", streams: [], participants: [] });
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [requestVersion]);

  return {
    ...state,
    retry: () => {
      setState(initialState);
      setRequestVersion((version) => version + 1);
    },
  };
}
