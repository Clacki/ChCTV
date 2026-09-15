import "server-only";

import { normalizeChzzkLiveThumbnailUrl } from "@/lib/chzzk-thumbnail-url";
import type { ChzzkLiveChannel } from "../../types/participant-broadcast";

const CHZZK_LIVES_API_URL = "https://openapi.chzzk.naver.com/open/v1/lives";
const CHZZK_CHANNELS_API_URL = "https://openapi.chzzk.naver.com/open/v1/channels";
const channelBatchSize = 20;

type ChzzkLiveResponse = {
  content?: {
    data?: ChzzkLive[];
    page?: {
      next?: string | null;
    };
  };
};

type ChzzkLive = {
  liveId: number;
  liveTitle: string;
  concurrentUserCount: number;
  channelId: string;
  channelName: string;
  channelImageUrl: string | null;
  liveThumbnailImageUrl: string | null;
  tags?: string[];
  categoryType?: string | null;
  liveCategory?: string | null;
  liveCategoryValue?: string | null;
};

type ChzzkChannel = {
  channelId: string;
  channelImageUrl: string | null;
};

type ChzzkChannelResponse = {
  content?: {
    data?: ChzzkChannel[];
  };
};

export type ChzzkApiErrorKind = "configuration" | "authentication" | "rate_limit" | "upstream" | "network";

export class ChzzkApiError extends Error {
  constructor(
    public readonly kind: ChzzkApiErrorKind,
    public readonly status?: number,
  ) {
    super("CHZZK API request failed");
  }
}

async function fetchLivePage(next?: string): Promise<{ lives: ChzzkLiveChannel[]; next: string | null }> {
  const clientId = process.env.CHZZK_CLIENT_ID;
  const clientSecret = process.env.CHZZK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new ChzzkApiError("configuration");
  }

  let response: Response;

  try {
    const url = new URL(CHZZK_LIVES_API_URL);
    url.searchParams.set("size", "20");

    if (next) {
      url.searchParams.set("next", next);
    }

    response = await fetch(url, {
      headers: {
        "Client-Id": clientId,
        "Client-Secret": clientSecret,
      },
      cache: "no-store",
    });
  } catch {
    throw new ChzzkApiError("network");
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new ChzzkApiError("authentication", response.status);
    }

    if (response.status === 429) {
      throw new ChzzkApiError("rate_limit", response.status);
    }

    throw new ChzzkApiError("upstream", response.status);
  }

  const body = (await response.json()) as ChzzkLiveResponse;

  return {
    lives: (body.content?.data ?? []).map((live) => ({
      liveTitle: live.liveTitle,
      viewerCount: live.concurrentUserCount,
      channelId: live.channelId,
      channelName: live.channelName,
      thumbnailUrl: normalizeChzzkLiveThumbnailUrl(live.liveThumbnailImageUrl),
      channelImageUrl: live.channelImageUrl,
      tags: live.tags ?? [],
      categoryType: live.categoryType ?? null,
      liveCategory: live.liveCategory ?? null,
      liveCategoryValue: live.liveCategoryValue ?? null,
    })),
    next: body.content?.page?.next ?? null,
  };
}

async function fetchChannelImageBatch(channelIds: readonly string[]): Promise<ChzzkChannel[]> {
  const clientId = process.env.CHZZK_CLIENT_ID;
  const clientSecret = process.env.CHZZK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new ChzzkApiError("configuration");
  }

  let response: Response;

  try {
    const url = new URL(CHZZK_CHANNELS_API_URL);
    url.searchParams.set("channelIds", channelIds.join(","));
    response = await fetch(url, {
      headers: {
        "Client-Id": clientId,
        "Client-Secret": clientSecret,
      },
      cache: "no-store",
    });
  } catch {
    throw new ChzzkApiError("network");
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new ChzzkApiError("authentication", response.status);
    }

    if (response.status === 429) {
      throw new ChzzkApiError("rate_limit", response.status);
    }

    throw new ChzzkApiError("upstream", response.status);
  }

  const body = (await response.json()) as ChzzkChannelResponse;
  return body.content?.data ?? [];
}

export async function getCurrentChzzkLives(): Promise<ChzzkLiveChannel[]> {
  const lives: ChzzkLiveChannel[] = [];
  const seenCursors = new Set<string>();
  let next: string | undefined;

  do {
    const page = await fetchLivePage(next);
    lives.push(...page.lives);

    if (!page.next) {
      break;
    }

    if (seenCursors.has(page.next)) {
      throw new ChzzkApiError("upstream");
    }

    seenCursors.add(page.next);
    next = page.next;
  } while (next);

  return lives;
}

/** Resolves profile images for the catalog without relying on a channel being live. */
export async function getChzzkChannelImages(channelIds: readonly string[]): Promise<Map<string, string>> {
  const uniqueChannelIds = [...new Set(channelIds.filter(Boolean))];
  const channelImages = new Map<string, string>();

  for (let index = 0; index < uniqueChannelIds.length; index += channelBatchSize) {
    const channels = await fetchChannelImageBatch(uniqueChannelIds.slice(index, index + channelBatchSize));

    for (const channel of channels) {
      if (channel.channelImageUrl) {
        channelImages.set(channel.channelId, channel.channelImageUrl);
      }
    }
  }

  return channelImages;
}
