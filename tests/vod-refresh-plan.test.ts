import { describe, expect, it } from "vitest";

import {
  createVodRefreshPlan,
  getVodRefreshBatch,
  VOD_REFRESH_BATCH_SIZE,
  VodRefreshBatchError,
} from "../src/server/vods/vod-refresh-plan";
import type { Participant } from "../src/types/participant";

function participants(channelIds: Array<string | null>): Participant[] {
  return channelIds.map((channelId, index) => ({
    streamerName: `참가자 ${index}`,
    rpName: null,
    channelId,
    affiliations: [],
    groups: [],
    tags: [],
    aliases: [],
  }));
}

describe("VOD refresh plan", () => {
  it.each([
    [0, 0],
    [1, 1],
    [10, 1],
    [11, 2],
    [230, 23],
    [231, 24],
  ])("calculates %i channels into %i batches", (channelCount, batchCount) => {
    const plan = createVodRefreshPlan(participants(Array.from({ length: channelCount }, (_, index) => `channel-${index}`)));

    expect(plan).toMatchObject({ batchSize: VOD_REFRESH_BATCH_SIZE, channelCount, batchCount });
  });

  it("excludes null channel IDs, removes duplicates, and preserves catalog order", () => {
    const plan = createVodRefreshPlan(participants(["first", null, "second", "first", "third"]));

    expect(plan.channelIds).toEqual(["first", "second", "third"]);
  });

  it("selects complete and final partial batches", () => {
    const plan = createVodRefreshPlan(participants(Array.from({ length: 21 }, (_, index) => `channel-${index}`)));

    expect(getVodRefreshBatch(plan, 0)).toEqual(Array.from({ length: 10 }, (_, index) => `channel-${index}`));
    expect(getVodRefreshBatch(plan, 1)).toEqual(Array.from({ length: 10 }, (_, index) => `channel-${index + 10}`));
    expect(getVodRefreshBatch(plan, 2)).toEqual(["channel-20"]);
  });

  it.each([-1, 0.5, 3])("rejects an invalid batch index", (batchIndex) => {
    const plan = createVodRefreshPlan(participants(["only"]));

    expect(() => getVodRefreshBatch(plan, batchIndex)).toThrow(VodRefreshBatchError);
  });
});
