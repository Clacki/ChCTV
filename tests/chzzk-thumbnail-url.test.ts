import { describe, expect, it } from "vitest";

import { normalizeChzzkLiveThumbnailUrl } from "../src/lib/chzzk-thumbnail-url";

describe("normalizeChzzkLiveThumbnailUrl", () => {
  it("replaces the CHZZK thumbnail type placeholder with the Discovery resolution", () => {
    expect(
      normalizeChzzkLiveThumbnailUrl(
        "https://livecloud-thumb.akamaized.net/chzzk/thumbnail/image_{type}.jpg",
      ),
    ).toBe("https://livecloud-thumb.akamaized.net/chzzk/thumbnail/image_720.jpg");
  });

  it("preserves URLs without a placeholder and null values", () => {
    expect(normalizeChzzkLiveThumbnailUrl("https://example.com/image_720.jpg")).toBe(
      "https://example.com/image_720.jpg",
    );
    expect(normalizeChzzkLiveThumbnailUrl(null)).toBeNull();
  });
});
