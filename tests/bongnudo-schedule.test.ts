import { describe, expect, it } from "vitest";

import { getBongnudoScheduleStatus } from "../src/lib/bongnudo-schedule";

describe("getBongnudoScheduleStatus", () => {
  it.each([
    ["Monday 17:59", "2024-01-01T08:59:00.000Z", "PRE_OPEN", "2024-01-01"],
    ["Monday 17:00", "2024-01-01T08:00:00.000Z", "PRE_OPEN", "2024-01-01"],
    ["Monday 18:00", "2024-01-01T09:00:00.000Z", "OPEN", "2024-01-01"],
    ["Friday 01:00", "2024-01-04T16:00:00.000Z", "OPEN", "2024-01-04"],
    ["Friday 18:00", "2024-01-05T09:00:00.000Z", "DAY_OFF", "2024-01-05"],
    ["Friday 17:00", "2024-01-05T08:00:00.000Z", "DAY_OFF", "2024-01-05"],
    ["Saturday 01:00", "2024-01-05T16:00:00.000Z", "DAY_OFF", "2024-01-05"],
    ["Sunday 03:00", "2024-01-06T18:00:00.000Z", "CLOSED", "2024-01-07"],
    ["Sunday 18:00", "2024-01-07T09:00:00.000Z", "OPEN", "2024-01-07"],
  ])("returns %s as %s", (_label, value, status, operatingDate) => {
    expect(getBongnudoScheduleStatus(new Date(value))).toEqual({ status, operatingDate });
  });
});
