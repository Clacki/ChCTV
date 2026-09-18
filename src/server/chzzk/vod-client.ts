import "server-only";

import type { Vod } from "@/types/vod";

import { mapChzzkVod } from "./vod-mapper";

const CHZZK_CHANNEL_VIDEOS_API_URL = "https://api.chzzk.naver.com/service/v1/channels";

type ChzzkVodListResponse = {
  content?: {
    page?: unknown;
    totalPages?: unknown;
    data?: unknown;
  };
};

export type ChzzkVodApiErrorKind = "upstream" | "network" | "invalid_response";

export class ChzzkVodApiError extends Error {
  constructor(
    public readonly kind: ChzzkVodApiErrorKind,
    public readonly channelId: string,
    public readonly status?: number,
  ) {
    super("CHZZK VOD request failed");
  }
}

export type ChzzkVodPage = {
  vods: Vod[];
  page: number;
  totalPages: number;
};

function nonNegativeInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

export async function getChzzkChannelVodPage(channelId: string, page = 1): Promise<ChzzkVodPage> {
  let response: Response;

  try {
    const url = new URL(`${CHZZK_CHANNEL_VIDEOS_API_URL}/${encodeURIComponent(channelId)}/videos`);
    url.searchParams.set("sortType", "LATEST");
    url.searchParams.set("videoType", "");
    url.searchParams.set("page", String(page));
    response = await fetch(url, { cache: "no-store" });
  } catch {
    throw new ChzzkVodApiError("network", channelId);
  }

  if (!response.ok) {
    throw new ChzzkVodApiError("upstream", channelId, response.status);
  }

  let body: ChzzkVodListResponse;

  try {
    body = (await response.json()) as ChzzkVodListResponse;
  } catch {
    throw new ChzzkVodApiError("invalid_response", channelId);
  }

  const responsePage = nonNegativeInteger(body.content?.page);
  const totalPages = nonNegativeInteger(body.content?.totalPages);

  if (
    responsePage === null ||
    totalPages === null ||
    !Array.isArray(body.content?.data) ||
    (totalPages === 0 && responsePage !== 0) ||
    (totalPages > 0 && responsePage < 1)
  ) {
    throw new ChzzkVodApiError("invalid_response", channelId);
  }

  return {
    vods: body.content.data.flatMap((item) => {
      const vod = mapChzzkVod(item);
      return vod ? [vod] : [];
    }),
    page: responsePage,
    totalPages,
  };
}

/** Reads newest-first pages until the first VOD older than the requested service start. */
export async function getChzzkChannelVods(
  channelId: string,
  startAt: number,
  knownVideoNos: ReadonlySet<number> = new Set(),
): Promise<Vod[]> {
  if (!Number.isFinite(startAt)) {
    throw new RangeError("VOD service start time must be a Unix timestamp in milliseconds");
  }

  const vods: Vod[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const result = await getChzzkChannelVodPage(channelId, page);
    totalPages = result.totalPages;
    const serviceVods = result.vods.filter((vod) => vod.videoType === "REPLAY" && vod.publishedAt >= startAt);
    vods.push(...serviceVods);

    // The complete current page is merged before stopping, so page-boundary VODs are not missed.
    if (
      result.vods.some((vod) => vod.publishedAt < startAt) ||
      serviceVods.some((vod) => knownVideoNos.has(vod.videoNo)) ||
      page >= totalPages
    ) {
      break;
    }

    page += 1;
  }

  return vods;
}
