import { beforeEach, describe, expect, it, vi } from "vitest";

const readVodSnapshot = vi.hoisted(() => vi.fn());
const writeVodSnapshot = vi.hoisted(() => vi.fn());
const getParticipantVods = vi.hoisted(() => vi.fn());

vi.mock("@/server/vods/vod-snapshot-store", () => ({ readVodSnapshot, writeVodSnapshot }));
vi.mock("@/server/chzzk/participant-vods", () => ({ getParticipantVods }));

import { refreshVodSnapshot } from "../src/server/vods/refresh-vod-snapshot";

describe("VOD snapshot refresh", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("uses the previous snapshot as incremental input and writes only the refreshed snapshot", async () => {
    const previous = { version: 1 as const, refreshedAt: 1, vods: [{ videoNo: 10 }], failures: [], startedAt: 1, completedAt: 1 };
    readVodSnapshot.mockResolvedValue(previous);
    getParticipantVods.mockResolvedValue({ vods: [{ videoNo: 11 }], failures: [{ channelId: "a", kind: "network" }] });

    const snapshot = await refreshVodSnapshot();

    expect(getParticipantVods).toHaveBeenCalledWith({ existingVods: previous.vods });
    expect(writeVodSnapshot).toHaveBeenCalledWith(expect.objectContaining({ version: 1, vods: [{ videoNo: 11 }], failures: [{ channelId: "a", kind: "network" }] }));
    expect(snapshot.refreshedAt).toBeGreaterThan(0);
  });
});
