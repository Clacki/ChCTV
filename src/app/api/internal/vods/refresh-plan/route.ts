import { NextResponse } from "next/server";

import { isVodRefreshAuthorized } from "@/server/vods/vod-refresh-auth";
import { createVodRefreshPlan } from "@/server/vods/vod-refresh-plan";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isVodRefreshAuthorized(request)) return NextResponse.json({ ok: false }, { status: 401 });

  const plan = createVodRefreshPlan();
  return NextResponse.json({ batchSize: plan.batchSize, channelCount: plan.channelCount, batchCount: plan.batchCount });
}
