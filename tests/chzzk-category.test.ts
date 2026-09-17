import { describe, expect, it } from "vitest";

import { CHZZK_GTA_CATEGORY_KEY, getDefaultGtaFilterEnabled, isChzzkGtaCategory } from "../src/lib/chzzk-category";

describe("CHZZK GTA category", () => {
  it("matches the API liveCategory identifier, not its display value", () => {
    expect(isChzzkGtaCategory(CHZZK_GTA_CATEGORY_KEY)).toBe(true);
    expect(isChzzkGtaCategory("Grand Theft Auto V")).toBe(false);
    expect(isChzzkGtaCategory(null)).toBe(false);
  });

  it.each(["PRE_OPEN", "CLOSED", "DAY_OFF"] as const)("does not enable the default GTA filter during %s", (status) => {
    expect(getDefaultGtaFilterEnabled(status)).toBe(false);
  });

  it("enables the default GTA filter only while OPEN", () => {
    expect(getDefaultGtaFilterEnabled("OPEN")).toBe(true);
  });
});
