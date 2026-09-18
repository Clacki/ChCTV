import { beforeEach, describe, expect, it, vi } from "vitest";

const isVodRefreshAuthorized = vi.hoisted(() => vi.fn());
const refreshVodSnapshot = vi.hoisted(() => vi.fn());

vi.mock("@/server/vods/vod-refresh-auth", () => ({ isVodRefreshAuthorized }));
vi.mock("@/server/vods/refresh-vod-snapshot", () => ({ refreshVodSnapshot }));

import { POST } from "../src/app/api/internal/vods/refresh/route";
import { VodRefreshBatchError } from "../src/server/vods/vod-refresh-plan";

describe("VOD batch refresh endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isVodRefreshAuthorized.mockReturnValue(true);
  });

  it.each(["", "-1", "abc", "1.5"])('rejects invalid batch "%s"', async (batch) => {
    const response = await POST(new Request(`https://example.test/api/internal/vods/refresh?batch=${batch}`));

    expect(response.status).toBe(400);
    expect(refreshVodSnapshot).not.toHaveBeenCalled();
  });

  it("rejects a batch index outside the dynamic plan", async () => {
    refreshVodSnapshot.mockRejectedValue(new VodRefreshBatchError());

    const response = await POST(new Request("https://example.test/api/internal/vods/refresh?batch=99"));

    expect(response.status).toBe(400);
  });

  it("passes a valid zero-based batch index to the refresh layer", async () => {
    refreshVodSnapshot.mockResolvedValue({ refreshedAt: 1, vods: [1, 2], failures: [1] });

    const response = await POST(new Request("https://example.test/api/internal/vods/refresh?batch=0"));

    await expect(response.json()).resolves.toEqual({ ok: true, batch: 0, refreshedAt: 1, vodCount: 2, failureCount: 1 });
    expect(refreshVodSnapshot).toHaveBeenCalledWith(0);
  });

  it("keeps the shared-secret check", async () => {
    isVodRefreshAuthorized.mockReturnValue(false);

    const response = await POST(new Request("https://example.test/api/internal/vods/refresh?batch=0"));

    expect(response.status).toBe(401);
  });
});
