import { readFile } from "node:fs/promises";

const CHZZK_VIDEOS_URL = "https://api.chzzk.naver.com/service/v1/channels";
const CHZZK_VIDEO_DETAIL_URL = "https://api.chzzk.naver.com/service/v2/videos";
const sampleStreamerNames = ["남봉", "다주", "멋사"];
const gtaVideoCategoryValue = "Grand Theft Auto V";
const maximumGtaSearchPages = 3;

/**
 * A bounded, manual-run PoC for inspecting publicly returned CHZZK VOD metadata.
 * It is intentionally not connected to the VOD collector, Redis, GitHub Actions, or UI.
 */
async function readSampleChannels() {
  const participants = JSON.parse(await readFile(new URL("../src/data/participants.json", import.meta.url), "utf8"));

  return sampleStreamerNames.flatMap((streamerName) => {
    const participant = participants.find((item) => item.streamerName === streamerName);
    return participant?.channelId ? [{ streamerName, channelId: participant.channelId }] : [];
  });
}

function asNonEmptyString(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function jsonValueType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function parseKoreaLocalDateTime(value) {
  if (typeof value !== "string") return null;

  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day, hour, minute, second] = match.map(Number);
  return Date.UTC(year, month - 1, day, hour - 9, minute, second);
}

function mapVodPocItem(value) {
  if (typeof value !== "object" || value === null || typeof value.channel !== "object" || value.channel === null) {
    return null;
  }

  const videoNo = asFiniteNumber(value.videoNo);
  const channelId = asNonEmptyString(value.channel.channelId);
  const title = asNonEmptyString(value.videoTitle);
  const publishedAt = asFiniteNumber(value.publishDateAt);

  if (videoNo === null || channelId === null || title === null || publishedAt === null) {
    return null;
  }

  return {
    videoNo,
    channelId,
    title,
    thumbnailUrl: asNonEmptyString(value.thumbnailImageUrl),
    publishedAt: new Date(publishedAt).toISOString(),
    liveStartedAt: asNonEmptyString(value.liveStartedAt),
    duration: asFiniteNumber(value.duration),
    url: `https://chzzk.naver.com/video/${videoNo}`,
  };
}

function mapGtaReplayPocItem(value) {
  const vod = mapVodPocItem(value);
  if (!vod || value.videoType !== "REPLAY" || value.videoCategoryValue !== gtaVideoCategoryValue) {
    return null;
  }

  return {
    ...vod,
    videoType: value.videoType,
    videoCategory: asNonEmptyString(value.videoCategory),
    videoCategoryValue: asNonEmptyString(value.videoCategoryValue),
  };
}

async function fetchVodPage(channelId, page = 1) {
  const url = new URL(`${CHZZK_VIDEOS_URL}/${encodeURIComponent(channelId)}/videos`);
  url.searchParams.set("sortType", "LATEST");
  url.searchParams.set("videoType", "");
  url.searchParams.set("page", String(page));

  const response = await fetch(url, {
    headers: {
      "User-Agent": "ChCTV-Vod-Poc/1.0 (manual research)",
      Referer: "https://chzzk.naver.com/",
    },
  });

  if (!response.ok) {
    throw new Error(`CHZZK VOD page request failed: ${response.status}`);
  }

  const body = await response.json();
  const data = Array.isArray(body?.content?.data) ? body.content.data : null;

  if (data === null || !Number.isInteger(body?.content?.page) || !Number.isInteger(body?.content?.totalPages)) {
    throw new Error("CHZZK VOD page response did not contain the expected page metadata");
  }

  return {
    page: body.content.page,
    totalPages: body.content.totalPages,
    items: data,
  };
}

async function fetchVodDetail(videoNo) {
  const response = await fetch(`${CHZZK_VIDEO_DETAIL_URL}/${encodeURIComponent(videoNo)}`, {
    headers: {
      "User-Agent": "ChCTV-Vod-Poc/1.0 (manual research)",
      Referer: "https://chzzk.naver.com/",
    },
  });

  if (!response.ok) {
    throw new Error(`CHZZK VOD detail request failed: ${response.status}`);
  }

  const body = await response.json();
  if (typeof body?.content !== "object" || body.content === null) {
    throw new Error("CHZZK VOD detail response did not contain content");
  }

  return body.content;
}

function readVideoNoArgument() {
  const index = process.argv.indexOf("--video-no");
  if (index === -1) return null;

  const videoNo = Number(process.argv[index + 1]);
  if (!Number.isSafeInteger(videoNo) || videoNo <= 0) {
    throw new Error("--video-no requires a positive integer");
  }

  return videoNo;
}

async function inspectThumbnail(thumbnailUrl) {
  if (!thumbnailUrl) return null;

  const response = await fetch(thumbnailUrl, {
    method: "HEAD",
    headers: {
      "User-Agent": "ChCTV-Vod-Poc/1.0 (manual research)",
      Referer: "https://chzzk.naver.com/",
    },
  });

  return {
    status: response.status,
    contentType: response.headers.get("content-type"),
    cacheControl: response.headers.get("cache-control"),
    expires: response.headers.get("expires"),
  };
}

async function main() {
  const verifyThumbnail = process.argv.includes("--verify-thumbnail");
  const findGta = process.argv.includes("--find-gta");
  const videoNo = readVideoNoArgument();

  if (videoNo !== null) {
    const item = await fetchVodDetail(videoNo);
    const publishDateAt = asFiniteNumber(item.publishDateAt);
    const liveOpenDate = item.liveOpenDate ?? null;
    const liveOpenDateAsKst = parseKoreaLocalDateTime(liveOpenDate);
    const duration = asFiniteNumber(item.duration);
    const inferredEndAt = liveOpenDateAsKst !== null && duration !== null ? liveOpenDateAsKst + duration * 1_000 : null;

    console.log(JSON.stringify({
      purpose: "manual, single-video web VOD response inspection only",
      requestCount: 1,
      video: {
        videoNo: asFiniteNumber(item.videoNo),
        channelId: asNonEmptyString(item?.channel?.channelId),
        channelName: asNonEmptyString(item?.channel?.channelName),
        videoTitle: asNonEmptyString(item.videoTitle),
        videoType: asNonEmptyString(item.videoType),
        videoCategory: asNonEmptyString(item.videoCategory),
        videoCategoryValue: asNonEmptyString(item.videoCategoryValue),
        publishDateAt: { value: publishDateAt, type: jsonValueType(item.publishDateAt) },
        publishDateAtIso: publishDateAt === null ? null : new Date(publishDateAt).toISOString(),
        liveOpenDate: { value: liveOpenDate, type: jsonValueType(liveOpenDate) },
        liveOpenDateInterpretedAsKst: liveOpenDateAsKst === null ? null : {
          utc: new Date(liveOpenDateAsKst).toISOString(),
          korea: new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", dateStyle: "short", timeStyle: "medium" }).format(new Date(liveOpenDateAsKst)),
        },
        duration: { value: duration, type: jsonValueType(item.duration) },
        inferredEndFromKstStartAndDuration: inferredEndAt === null ? null : {
          utc: new Date(inferredEndAt).toISOString(),
          korea: new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", dateStyle: "short", timeStyle: "medium" }).format(new Date(inferredEndAt)),
          publishDelayAfterInferredEndSeconds: publishDateAt === null ? null : (publishDateAt - inferredEndAt) / 1_000,
        },
        thumbnailImageUrl: asNonEmptyString(item.thumbnailImageUrl),
        matchesReplayGtaCategory: item.videoType === "REPLAY" && item.videoCategoryValue === gtaVideoCategoryValue,
      },
    }, null, 2));
    return;
  }

  const channels = await readSampleChannels();
  const results = [];

  for (const channel of channels) {
    try {
      const page = await fetchVodPage(channel.channelId);
      const firstItem = page.items[0] ?? null;
      const vods = page.items.flatMap((item) => {
        const mapped = mapVodPocItem(item);
        return mapped ? [mapped] : [];
      });

      results.push({
        ...channel,
        page: page.page,
        totalPages: page.totalPages,
        itemCount: page.items.length,
        replayCount: page.items.filter((item) => item?.videoType === "REPLAY").length,
        firstItem: vods[0] ?? null,
        category: firstItem ? {
          categoryType: asNonEmptyString(firstItem.categoryType),
          videoCategory: asNonEmptyString(firstItem.videoCategory),
          videoCategoryValue: asNonEmptyString(firstItem.videoCategoryValue),
        } : null,
        thumbnail: verifyThumbnail && vods[0] ? await inspectThumbnail(vods[0].thumbnailUrl) : null,
      });

      if (findGta) {
        const pages = page.totalPages > 0 ? [page] : [];
        const lastPage = Math.min(page.totalPages, maximumGtaSearchPages);

        for (let pageNumber = 2; pageNumber <= lastPage; pageNumber += 1) {
          pages.push(await fetchVodPage(channel.channelId, pageNumber));
        }

        const items = pages.flatMap((result) => result.items);
        const gtaReplaySamples = items.flatMap((item) => {
          const mapped = mapGtaReplayPocItem(item);
          return mapped ? [mapped] : [];
        }).slice(0, 3);
        const categoryFieldMissingCount = items.filter((item) =>
          !asNonEmptyString(item?.videoCategory) || !asNonEmptyString(item?.videoCategoryValue),
        ).length;

        results[results.length - 1] = {
          ...results[results.length - 1],
          gtaSearch: {
            targetVideoCategoryValue: gtaVideoCategoryValue,
            scannedPages: pages.map((result) => result.page),
            emptyResponsePage: page.totalPages === 0 ? page.page : null,
            maxPagesPerChannel: maximumGtaSearchPages,
            observedVideoTypes: [...new Set(items.map((item) => asNonEmptyString(item?.videoType)).filter(Boolean))],
            categoryFieldMissingCount,
            gtaReplaySamples,
          },
        };
      }
    } catch (error) {
      results.push({ ...channel, error: error instanceof Error ? error.message : "Unknown request failure" });
    }
  }

  console.log(JSON.stringify({
    purpose: "manual, bounded web VOD response inspection only",
    requestCount: findGta
      ? `up to ${channels.length * maximumGtaSearchPages} VOD pages${verifyThumbnail ? " plus up to one HEAD request per channel" : ""}`
      : `${channels.length} VOD pages${verifyThumbnail ? " plus up to one HEAD request per channel" : ""}`,
    results,
  }, null, 2));
}

await main();
