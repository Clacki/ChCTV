"use client";

import { useCallback, useEffect, useState } from "react";

import { CHCTV_HELPER_PING, CHCTV_HELPER_READY } from "@/features/multiview/chctv-helper";

export type ChctvHelperStatus = "checking" | "ready" | "unavailable";

export function useChctvHelperStatus(): { status: ChctvHelperStatus; retry: () => void } {
  const [status, setStatus] = useState<ChctvHelperStatus>("checking");
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setStatus("checking");
    setAttempt((currentAttempt) => currentAttempt + 1);
  }, []);

  useEffect(() => {
    const requestId = crypto.randomUUID();
    const onMessage = (event: MessageEvent<{ type?: unknown; requestId?: unknown; ready?: unknown }>) => {
      if (event.source !== window || event.origin !== window.location.origin) return;
      if (event.data?.type !== CHCTV_HELPER_READY || event.data.requestId !== requestId) return;

      window.clearTimeout(timeoutId);
      window.removeEventListener("message", onMessage);
      setStatus(event.data.ready === true ? "ready" : "unavailable");
    };
    const timeoutId = window.setTimeout(() => {
      window.removeEventListener("message", onMessage);
      setStatus("unavailable");
    }, 1_500);

    window.addEventListener("message", onMessage);
    window.postMessage({ type: CHCTV_HELPER_PING, requestId }, window.location.origin);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("message", onMessage);
    };
  }, [attempt]);

  return { status, retry };
}
