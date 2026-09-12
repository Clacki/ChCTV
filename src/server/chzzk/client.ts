import "server-only";

const CHZZK_API_URL = "https://openapi.chzzk.naver.com/open/v1/lives";

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
};

export type ChzzkLiveChannel = {
  liveId: number;
  channelId: string;
  channelName: string;
  liveTitle: string;
  viewerCount: number;
  thumbnailUrl: string | null;
  channelImageUrl: string | null;
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
    const url = new URL(CHZZK_API_URL);
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
    liveId: live.liveId,
    liveTitle: live.liveTitle,
    viewerCount: live.concurrentUserCount,
    channelId: live.channelId,
    channelName: live.channelName,
    thumbnailUrl: live.liveThumbnailImageUrl,
    channelImageUrl: live.channelImageUrl,
    })),
    next: body.content?.page?.next ?? null,
  };
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
