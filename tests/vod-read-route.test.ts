import { beforeEach, describe, expect, it, vi } from "vitest";

const readVods = vi.hoisted(() => vi.fn());

vi.mock("@/server/vods/read-vods", () => ({ readVods }));

import { GET } from "../src/app/api/vods/route";

describe("GET /api/vods", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the read-model response without invoking a refresh path", async () => {
    readVods.mockResolvedValue({ items: [{ videoNo: 1 }], total: 1 });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ items: [{ videoNo: 1 }], total: 1 });
    expect(readVods).toHaveBeenCalledOnce();
  });

  it("does not turn a Snapshot read failure into an empty list", async () => {
    readVods.mockRejectedValue(new Error("redis unavailable"));

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ ok: false });
  });
});
