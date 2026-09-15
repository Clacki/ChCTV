import type { StreamCardData } from "@/types/stream-card";

export type SavedMultiview = {
  id: string;
  name: string;
  channelIds: readonly string[];
};

export function getNextDefaultMultiviewName(savedMultiviews: readonly Pick<SavedMultiview, "name">[]): string {
  const savedNames = new Set(savedMultiviews.map((multiview) => multiview.name.trim().toLocaleLowerCase("ko-KR")));
  let number = 1;

  while (savedNames.has(`멀티뷰 ${number}`)) {
    number += 1;
  }

  return `멀티뷰 ${number}`;
}

export function getSavedMultiviewStatus(
  channelIds: readonly string[],
  streamsByChannelId: ReadonlyMap<string, StreamCardData>,
) {
  return {
    channelCount: channelIds.length,
    liveCount: channelIds.filter((channelId) => streamsByChannelId.has(channelId)).length,
  };
}
