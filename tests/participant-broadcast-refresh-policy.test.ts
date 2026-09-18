import { describe, expect, it } from "vitest";

import { getParticipantBroadcastRefreshPolicy, isRisingAvailable } from "../src/lib/participant-broadcast-refresh-policy";

describe("participant broadcast refresh policy", () => {
  it.each([
    ["PRE_OPEN", "2024-01-01T08:00:00.000Z", "PRE_OPEN", 300],
    ["OPEN", "2024-01-01T09:00:00.000Z", "OPEN", 300],
    ["CLOSED", "2024-01-01T07:00:00.000Z", "CLOSED", 900],
    ["DAY_OFF", "2024-01-05T09:00:00.000Z", "DAY_OFF", 900],
    ["DAY_OFF does not pre-open", "2024-01-05T08:00:00.000Z", "DAY_OFF", 900],
  ])("uses the expected interval during %s", (_label, value, scheduleStatus, intervalSeconds) => {
    expect(getParticipantBroadcastRefreshPolicy(new Date(value))).toEqual({ scheduleStatus, intervalSeconds });
  });
});

describe("rising availability", () => {
  it.each([
    ["PRE_OPEN", true],
    ["OPEN", true],
    ["CLOSED", false],
    ["DAY_OFF", false],
  ] as const)("is %s: %s", (status, expected) => {
    expect(isRisingAvailable(status)).toBe(expected);
  });
});
