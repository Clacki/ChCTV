import { describe, expect, it } from "vitest";
import { getRisingIncrease, getRisingSortValue } from "../src/lib/rising-broadcasts";
const snapshots = (values: number[]) => values.map((viewerCount, index) => ({ timestamp: index * 300_000, viewerCount }));
describe("rising broadcasts", () => {
  it("detects a focus trend after two snapshots", () => expect(getRisingIncrease(snapshots([120, 140]))).toBe(20));
  it("keeps the recent increase separate from the ten-minute sort value", () => {
    expect(getRisingIncrease(snapshots([120, 140, 165]))).toBe(25);
    expect(getRisingSortValue(snapshots([120, 140, 165]))).toBe(45);
  });
  it.each([[120, 128], [80, 95], [120, 180, 160], [120]])("rejects an ineligible trend", (...values) => expect(getRisingIncrease(snapshots(values))).toBeNull());
});
