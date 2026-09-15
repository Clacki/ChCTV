export function getMultiviewUrl(channelIds: readonly string[]): string {
  const params = new URLSearchParams();
  channelIds.forEach((channelId) => {
    params.append("channel", channelId);
  });
  return `/multiview?${params.toString()}`;
}
