import { describe, expect, it, vi } from "vitest";

import { getMultiviewUrl, openMultiviewWindow } from "../src/features/multiview/window-launcher";

describe("openMultiviewWindow", () => {
  it("opens one ChCTV multiview tab with every selected channel", () => {
    const open = vi.fn(() => ({}));
    const browserWindow = { open } as unknown as Window;

    expect(openMultiviewWindow(browserWindow, ["A", "B", "C"])).toEqual({ ok: true });
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith(
      "/multiview?channel=A&channel=B&channel=C",
      "_blank",
    );
  });

  it("returns a popup-blocked result without navigating the current page", () => {
    const browserWindow = { open: vi.fn(() => null) } as unknown as Window;

    expect(openMultiviewWindow(browserWindow, ["A"])).toEqual({ ok: false, reason: "popup-blocked" });
    expect(getMultiviewUrl(["A", "B"])).toBe("/multiview?channel=A&channel=B");
  });
});
