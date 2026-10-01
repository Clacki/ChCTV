/** 2026-09-14 18:00:00 Asia/Seoul, expressed independently of the server timezone. */
export const BONGNUDO_VOD_START_AT = Date.parse("2026-09-14T09:00:00.000Z");

/** 2026-10-07 03:00:00 Asia/Seoul: the official end plus a two-day VOD registration grace period. */
export const BONGNUDO_VOD_COLLECTION_END_AT = Date.parse("2026-10-06T18:00:00.000Z");

export const BONGNUDO_VOD_CATEGORY_VALUE = "Grand Theft Auto V";

export function isBongnudoVodPublishedAt(publishedAt: number, startAt = BONGNUDO_VOD_START_AT, endAt = BONGNUDO_VOD_COLLECTION_END_AT): boolean {
  return Number.isFinite(publishedAt) && Number.isFinite(startAt) && Number.isFinite(endAt) && startAt <= publishedAt && publishedAt < endAt;
}
