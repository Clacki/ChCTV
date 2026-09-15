export const MAX_MULTIVIEW_CHANNELS = 6;

const channelIdPattern = /^[a-fA-F0-9]{32}$/;

export function getValidMultiviewChannelIds(channelIds: readonly string[]): string[] {
  const uniqueChannelIds = new Set<string>();

  for (const channelId of channelIds) {
    if (!channelIdPattern.test(channelId)) continue;

    uniqueChannelIds.add(channelId.toLowerCase());
    if (uniqueChannelIds.size === MAX_MULTIVIEW_CHANNELS) break;
  }

  return [...uniqueChannelIds];
}
