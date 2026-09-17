import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { PostHogPageView } from "@/lib/analytics/posthog-page-view";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChCTV",
  icons: {
    icon: "/favicon.png",
  },
  description: "치지직 합방을 더 편하게 보는 방법.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <PostHogPageView />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
