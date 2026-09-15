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
  const { cropTop, cropBottom, cropRight, cropCenterOffset } = getChzzkViewerCrop(profile);

  return (
    <iframe
      className="absolute border-0"
      src={getChzzkLiveUrl(channelId)}
      title={`${slotLabel} CHZZK LIVE`}
      allow="autoplay; fullscreen; encrypted-media; local-network-access; loopback-network"
      allowFullScreen
      scrolling="no"
      style={{
        left: "50%",
        top: `calc(50% + ${cropCenterOffset})`,
        width: `calc(max(100cqw, 177.7778cqh) + ${cropRight})`,
        height: `calc(max(100cqh, 56.25cqw) + ${cropTop} + ${cropBottom})`,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}

export function ChzzkChat({ channelId }: Readonly<{ channelId: string }>) {
  return (
    <iframe
      className="size-full border-0"
      src={getChzzkChatUrl(channelId)}
      title="Main CHZZK Chat"
      allow="autoplay; fullscreen"
      allowFullScreen
    />
  );
}
