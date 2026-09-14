const CHZZK_DISCOVERY_THUMBNAIL_TYPE = "720";

export function normalizeChzzkLiveThumbnailUrl(url: string | null): string | null {
  return url?.replace("{type}", CHZZK_DISCOVERY_THUMBNAIL_TYPE) ?? null;
}
