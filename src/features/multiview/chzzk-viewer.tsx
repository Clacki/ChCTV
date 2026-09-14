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
};

const viewerCrops: Record<ViewerProfile, ViewerCrop> = {
  main: { cropTop: "3rem", cropBottom: "1rem", cropRight: "1rem" },
  sub: { cropTop: "2.5rem", cropBottom: "1rem", cropRight: "1rem" },
};

export function getChzzkViewerCrop(profile: ViewerProfile): ViewerCrop {
  return viewerCrops[profile];
}

export function ChzzkViewer({
  channelId,
  slotLabel,
  profile,
}: Readonly<{ channelId: string; slotLabel: string; profile: ViewerProfile }>) {
  const { cropTop, cropBottom, cropRight } = getChzzkViewerCrop(profile);

  return (
    <iframe
      className="absolute left-0 border-0"
      src={getChzzkLiveUrl(channelId)}
      title={`${slotLabel} CHZZK LIVE`}
      allow="autoplay; fullscreen"
      allowFullScreen
      style={{
        top: `-${cropTop}`,
        width: `calc(100% + ${cropRight})`,
        height: `calc(100% + ${cropTop} + ${cropBottom})`,
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
