import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export function initializeAnalytics() {
  if (!key || typeof window === "undefined") return false;

  posthog.init(key, {
    api_host: host || "https://us.i.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    person_profiles: "never",
  });

  return true;
}

export function capturePageView(pathname: string) {
  if (!key) return;
  posthog.capture("$pageview", { $current_url: window.location.origin + pathname });
}
