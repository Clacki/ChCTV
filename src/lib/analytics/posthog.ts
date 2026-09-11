import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
let initialized = false;

export function initializeAnalytics() {
  if (!key || typeof window === "undefined") return false;
  if (initialized) return true;

  posthog.init(key, {
    api_host: host || "https://us.i.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    person_profiles: "never",
  });

  initialized = true;
  return true;
}

export function capturePageView(pathname: string) {
  if (!key || typeof window === "undefined") return;
  posthog.capture("$pageview", { $current_url: window.location.origin + pathname });
}

export function captureEvent(event: string, properties: Record<string, string | number>) {
  if (!key || typeof window === "undefined") return;
  posthog.capture(event, properties);
}
