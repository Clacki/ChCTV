import { describe, expect, it } from "vitest";

import { getMultiviewSlotLabel } from "../src/features/multiview/multiview-slot";

describe("getMultiviewSlotLabel", () => {
  it("uses selection order to derive Main and Sub slot labels", () => {
    expect([0, 1, 2, 3, 4, 5].map(getMultiviewSlotLabel)).toEqual([
      "Main",
      "Sub 1",
      "Sub 2",
      "Sub 3",
      "Sub 4",
      "Sub 5",
    ]);
  });
});
