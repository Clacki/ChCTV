import { describe, expect, it } from "vitest";

import {
  BONGNUDO_VOD_COLLECTION_END_AT,
  BONGNUDO_VOD_START_AT,
  isBongnudoVodPublishedAt,
} from "../src/lib/bongnudo-vod";

describe("Bongnudo VOD registration period", () => {
  it("uses the KST event start and the two-day registration grace end as a half-open range", () => {
    expect(new Date(BONGNUDO_VOD_START_AT).toISOString()).toBe("2026-09-14T09:00:00.000Z");
    expect(new Date(BONGNUDO_VOD_COLLECTION_END_AT).toISOString()).toBe("2026-10-06T18:00:00.000Z");

    expect(isBongnudoVodPublishedAt(BONGNUDO_VOD_START_AT - 1)).toBe(false);
    expect(isBongnudoVodPublishedAt(BONGNUDO_VOD_START_AT)).toBe(true);
    expect(isBongnudoVodPublishedAt(BONGNUDO_VOD_COLLECTION_END_AT - 1)).toBe(true);
    expect(isBongnudoVodPublishedAt(BONGNUDO_VOD_COLLECTION_END_AT)).toBe(false);
  });
});
