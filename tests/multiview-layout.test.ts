import { describe, expect, it } from "vitest";

import {
  getDefaultMultiviewLayoutPreset,
  getMultiviewLayout,
  type MultiviewLayoutPreset,
} from "../src/features/multiview/multiview-layout";
import { getViewerGeometry } from "../src/features/multiview/viewer-geometry";

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
        expect(layout.columnWeights.length).toBeGreaterThan(0);
        expect(layout.rowWeights.length).toBeGreaterThan(0);
      });
    });
  });

  it("fits each layout canvas within both workspace dimensions", () => {
    const layout = getMultiviewLayout(6, "focus-bottom");
    const geometry = getViewerGeometry({
      preset: "focus-bottom",
      channelCount: 6,
      width: 900,
      height: 760,
      gap: 0,
      columnWeights: layout.columnWeights,
      rowWeights: layout.rowWeights,
    });

    expect(geometry.width).toBeLessThanOrEqual(900);
    expect(geometry.height).toBeLessThanOrEqual(760);
  });

  it("uses populated single-axis Sub arrangements for focused layouts", () => {
    [2, 3, 4, 5, 6].forEach((count) => {
      expect(getMultiviewLayout(count, "focus-right").areas).not.toContain(".");
      expect(getMultiviewLayout(count, "focus-bottom").areas).not.toContain(".");
    });
  });
});
