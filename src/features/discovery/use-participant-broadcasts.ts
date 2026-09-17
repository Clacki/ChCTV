"use client";

import { useEffect, useRef, useState } from "react";

import { toDiscoveryMembers, type DiscoveryMember } from "@/features/discovery/participant-broadcast-adapter";
import { getParticipantBroadcastRefreshPolicy } from "@/lib/participant-broadcast-refresh-policy";
import type { CachedParticipantBroadcastsResult } from "@/types/participant-broadcast";
import type { StreamCardData } from "@/types/stream-card";

type ParticipantBroadcastState =
  | { status: "loading"; streams: readonly StreamCardData[]; members: readonly DiscoveryMember[]; risingHistoryReady: false }
  | { status: "success"; streams: readonly StreamCardData[]; members: readonly DiscoveryMember[]; risingHistoryReady: boolean }
  | { status: "error"; streams: readonly StreamCardData[]; members: readonly DiscoveryMember[]; risingHistoryReady: false };

const initialState: ParticipantBroadcastState = { status: "loading", streams: [], members: [], risingHistoryReady: false };

export function useParticipantBroadcasts() {
  const [state, setState] = useState<ParticipantBroadcastState>(initialState);
  const retryRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    let controller: AbortController | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;
    let requestInFlight = false;

    async function load() {
      if (disposed || requestInFlight) {
        return;
      }

      requestInFlight = true;
      controller = new AbortController();

      try {
        const response = await fetch("/api/chzzk/participant-broadcasts", { signal: controller.signal });
        const result = await response.json() as CachedParticipantBroadcastsResult;

        if (!response.ok || result.status === "error") {
          throw new Error("Failed to load participant broadcasts");
        }

        const members = toDiscoveryMembers(result.broadcasts);
        if (!disposed) {
          setState({
            status: "success",
            streams: members.flatMap((member) => member.status === "LIVE" ? [member.stream] : []),
            members,
            risingHistoryReady: result.risingHistoryReady,
          });
        }
      } catch (error) {
        if (!disposed && (error as DOMException).name !== "AbortError") {
          setState({ status: "error", streams: [], members: [], risingHistoryReady: false });
        }
      } finally {
        requestInFlight = false;
        controller = null;
      }
    }

    function scheduleNextPoll() {
      if (disposed || document.visibilityState !== "visible") {
        return;
      }

      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        timer = null;
        void load().finally(scheduleNextPoll);
      }, getParticipantBroadcastRefreshPolicy().intervalSeconds * 1000);
    }

    function refreshAndSchedule() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      void load().finally(scheduleNextPoll);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        refreshAndSchedule();
      } else if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    retryRef.current = () => {
      setState(initialState);
      refreshAndSchedule();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    refreshAndSchedule();

    return () => {
      disposed = true;
      requestInFlight = false;
      if (timer) {
        clearTimeout(timer);
      }
      controller?.abort();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return {
    ...state,
    retry: () => retryRef.current(),
  };
}
