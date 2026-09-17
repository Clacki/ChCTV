import "server-only";

import { unstable_cache } from "next/cache";

import { getChzzkChannelImages } from "./client";

// Profile images and channel metadata do not need to follow the LIVE refresh cadence.
export const CHZZK_CHANNEL_METADATA_CACHE_SECONDS = 6 * 60 * 60;

const getCachedChannelImageEntries = unstable_cache(
  async (channelIds: readonly string[]) => {
    console.info("[chzzk] channel metadata cache miss; fetching upstream");
    return [...(await getChzzkChannelImages(channelIds)).entries()];
  },
  ["chzzk-channel-metadata"],
  { revalidate: CHZZK_CHANNEL_METADATA_CACHE_SECONDS },
);

export async function getCachedChzzkChannelImages(channelIds: readonly string[]): Promise<Map<string, string>> {
  return new Map(await getCachedChannelImageEntries([...channelIds].sort()));
}
