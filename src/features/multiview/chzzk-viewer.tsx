"use client";

import { useEffect, useRef, useState } from "react";

const VIRTUAL_VIEWPORT_WIDTH = 1280;
const VIRTUAL_VIEWPORT_HEIGHT = 720;

export function getChzzkLiveUrl(channelId: string): string {
  return `https://chzzk.naver.com/live/${encodeURIComponent(channelId)}`;
}

export function getChzzkChatUrl(channelId: string): string {
  return `${getChzzkLiveUrl(channelId)}/chat`;
}

export type ViewerProfile = "main" | "sub";

type ViewerCrop = {
  cropTop: string;
  cropBottom: string;
  cropRight: string;
  cropCenterOffset: string;
};

const viewerCrops: Record<ViewerProfile, ViewerCrop> = {
  main: { cropTop: "3rem", cropBottom: "1rem", cropRight: "1rem", cropCenterOffset: "-1rem" },
  sub: { cropTop: "2.5rem", cropBottom: "1rem", cropRight: "1rem", cropCenterOffset: "-0.75rem" },
};

export function getChzzkViewerCrop(profile: ViewerProfile): ViewerCrop {
  return viewerCrops[profile];
}

export function ChzzkViewer({
  channelId,
  slotLabel,
  profile,
}: Readonly<{ channelId: string; slotLabel: string; profile: ViewerProfile }>) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(
        entry.contentRect.width / VIRTUAL_VIEWPORT_WIDTH,
        entry.contentRect.height / VIRTUAL_VIEWPORT_HEIGHT,
      ));
    });

    observer.observe(viewer);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={viewerRef} className="absolute inset-0 overflow-hidden" data-viewer-profile={profile}>
      <iframe
        className="absolute left-0 top-0 border-0"
        src={getChzzkLiveUrl(channelId)}
        title={`${slotLabel} CHZZK LIVE`}
        allow="autoplay; fullscreen; encrypted-media; local-network-access; loopback-network"
        allowFullScreen
        scrolling="no"
        style={{
          width: VIRTUAL_VIEWPORT_WIDTH,
          height: VIRTUAL_VIEWPORT_HEIGHT,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
        }}
      />
    </div>
  );
}

export function ChzzkChat({ channelId }: Readonly<{ channelId: string }>) {
  return (
    <div className="size-full min-h-0 min-w-0 overflow-hidden">
      <iframe
        className="block size-full border-0"
        src={getChzzkChatUrl(channelId)}
        title="Main CHZZK Chat"
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
