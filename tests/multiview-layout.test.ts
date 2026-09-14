import { describe, expect, it } from "vitest";

import {
  getDefaultMultiviewLayoutPreset,
  getMultiviewLayout,
  type MultiviewLayoutPreset,
} from "../src/features/multiview/multiview-layout";

describe("multiview layouts", () => {
  it("uses the requested defaults for one through six channels", () => {
    expect([1, 2, 3, 4, 5, 6].map(getDefaultMultiviewLayoutPreset)).toEqual([
      "balanced",
      "focus-right",
      "focus-bottom",
      "focus-bottom",
      "focus-right",
      "balanced",
    ]);
  });

  it("provides a grid area for every channel count and preset", () => {
    const presets: MultiviewLayoutPreset[] = ["focus-right", "focus-bottom", "balanced"];

    presets.forEach((preset) => {
      [1, 2, 3, 4, 5, 6].forEach((count) => {
        const layout = getMultiviewLayout(count, preset);

        expect(layout.areas).toContain("main");
        expect(layout.columns).toContain("minmax");
        expect(layout.rows).toContain("minmax");
      });
    });
  });
});
