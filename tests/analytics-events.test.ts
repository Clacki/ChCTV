import { beforeEach, describe, expect, it, vi } from "vitest";

const { captureEvent } = vi.hoisted(() => ({ captureEvent: vi.fn() }));

vi.mock("../src/lib/analytics/posthog", () => ({ captureEvent }));

import { analytics, getAnalyticsEnvironment } from "../src/lib/analytics/events";

describe("analytics events", () => {
  beforeEach(() => {
    captureEvent.mockClear();
  });

  it("adds only the defined properties to channel_selected", () => {
    analytics.channelSelected({
      eventSlug: "bongnudo2",
      source: "channel_browser",
      channelId: "channel-1",
      selectedCount: 3,
    });

    expect(captureEvent).toHaveBeenCalledWith("channel_selected", {
      event_slug: "bongnudo2",
      source: "channel_browser",
      environment: getAnalyticsEnvironment(),
      channel_id: "channel-1",
      selected_count: 3,
    });
  });

  it("adds the multiview channel count", () => {
    analytics.multiviewStarted({
      eventSlug: "bongnudo2",
      source: "multiview",
      channelCount: 4,
    });

    expect(captureEvent).toHaveBeenCalledWith("multiview_started", {
      event_slug: "bongnudo2",
      source: "multiview",
      environment: getAnalyticsEnvironment(),
      channel_count: 4,
    });
  });
});
