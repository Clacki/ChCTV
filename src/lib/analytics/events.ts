import { captureEvent } from "./posthog";

export type AnalyticsEnvironment = "development" | "production";
export type AnalyticsSource = "channel_browser" | "multiview";

type CommonEventProperties = {
  eventSlug: string;
  source: AnalyticsSource;
};

type ChannelSelectionProperties = CommonEventProperties & {
  channelId: string;
  selectedCount: number;
};

type FilterChangedProperties = CommonEventProperties & {
  filterType: string;
  filterValue: string;
};

type ChannelCountProperties = CommonEventProperties & {
  channelCount: number;
};

type ChannelProperties = CommonEventProperties & {
  channelId: string;
};

export function getAnalyticsEnvironment(): AnalyticsEnvironment {
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

function commonProperties({ eventSlug, source }: CommonEventProperties) {
  return {
    event_slug: eventSlug,
    source,
    environment: getAnalyticsEnvironment(),
  };
}

export const analytics = {
  channelSelected(properties: ChannelSelectionProperties) {
    captureEvent("channel_selected", {
      ...commonProperties(properties),
      channel_id: properties.channelId,
      selected_count: properties.selectedCount,
    });
  },

  channelDeselected(properties: ChannelSelectionProperties) {
    captureEvent("channel_deselected", {
      ...commonProperties(properties),
      channel_id: properties.channelId,
      selected_count: properties.selectedCount,
    });
  },

  filterChanged(properties: FilterChangedProperties) {
    captureEvent("filter_changed", {
      ...commonProperties(properties),
      filter_type: properties.filterType,
      filter_value: properties.filterValue,
    });
  },

  multiviewStarted(properties: ChannelCountProperties) {
    captureEvent("multiview_started", {
      ...commonProperties(properties),
      channel_count: properties.channelCount,
    });
  },

  multiviewChannelAdded(properties: ChannelProperties) {
    captureEvent("multiview_channel_added", {
      ...commonProperties(properties),
      channel_id: properties.channelId,
    });
  },

  multiviewChannelRemoved(properties: ChannelProperties) {
    captureEvent("multiview_channel_removed", {
      ...commonProperties(properties),
      channel_id: properties.channelId,
    });
  },

  mainChannelChanged(properties: ChannelProperties) {
    captureEvent("main_channel_changed", {
      ...commonProperties(properties),
      channel_id: properties.channelId,
    });
  },

  multiviewShared(properties: ChannelCountProperties) {
    captureEvent("multiview_shared", {
      ...commonProperties(properties),
      channel_count: properties.channelCount,
    });
  },
};
