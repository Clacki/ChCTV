"use client";

import { useEffect, useState } from "react";

import { toDiscoveryMembers, type DiscoveryMember } from "@/features/discovery/participant-broadcast-adapter";
import type { CachedParticipantBroadcastsResult } from "@/types/participant-broadcast";
import type { StreamCardData } from "@/types/stream-card";

type ParticipantBroadcastState =
  | { status: "loading"; streams: readonly StreamCardData[]; members: readonly DiscoveryMember[] }
  | { status: "success"; streams: readonly StreamCardData[]; members: readonly DiscoveryMember[] }
  | { status: "error"; streams: readonly StreamCardData[]; members: readonly DiscoveryMember[] };

const initialState: ParticipantBroadcastState = { status: "loading", streams: [], members: [] };

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

        const members = toDiscoveryMembers(result.broadcasts);
        setState({
          status: "success",
          streams: members.flatMap((member) => member.status === "LIVE" ? [member.stream] : []),
          members,
        });
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") {
          setState({ status: "error", streams: [], members: [] });
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
