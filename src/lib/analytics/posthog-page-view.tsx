"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { capturePageView, initializeAnalytics } from "./posthog";

export function PostHogPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!initializeAnalytics()) return;
    capturePageView(pathname);
  }, [pathname]);

  return null;
}
