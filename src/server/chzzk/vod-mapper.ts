import type { Vod } from "@/types/vod";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Maps a public CHZZK channel-video response item to ChCTV's allowlisted VOD model. */
export function mapChzzkVod(value: unknown): Vod | null {
  if (!isRecord(value) || !isRecord(value.channel)) {
    return null;
  }

  const videoNo = finiteNumber(value.videoNo);
  const title = stringOrNull(value.videoTitle);
  const viewCount = finiteNumber(value.readCount);
  const duration = finiteNumber(value.duration);
  const publishedAt = finiteNumber(value.publishDateAt);
  const videoType = stringOrNull(value.videoType);
  const channelId = stringOrNull(value.channel.channelId);
  const channelName = stringOrNull(value.channel.channelName);

  if (
    videoNo === null ||
    title === null ||
    viewCount === null ||
    duration === null ||
    publishedAt === null ||
    videoType === null ||
    channelId === null ||
    channelName === null
  ) {
    return null;
  }

  return {
    videoNo,
    channelId,
    title,
    thumbnailUrl: stringOrNull(value.thumbnailImageUrl),
    viewCount,
    duration,
    publishedAt,
    videoType,
    channelName,
    channelImageUrl: stringOrNull(value.channel.channelImageUrl),
  };
}
