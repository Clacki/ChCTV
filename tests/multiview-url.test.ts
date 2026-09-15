import { describe, expect, it } from "vitest";

import { getMultiviewUrl } from "../src/features/multiview/multiview-url";

describe("getMultiviewUrl", () => {
  it("keeps every selected channel in order as repeated query parameters", () => {
    expect(getMultiviewUrl(["A", "B", "C"])).toBe("/multiview?channel=A&channel=B&channel=C");
  });
});
