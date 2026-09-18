import { NextResponse } from "next/server";
import { refreshVodSnapshot } from "@/server/vods/refresh-vod-snapshot";
import { isVodRefreshAuthorized } from "@/server/vods/vod-refresh-auth";
import { VodRefreshBatchError } from "@/server/vods/vod-refresh-plan";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isVodRefreshAuthorized(request)) return NextResponse.json({ ok: false }, { status: 401 });

  const batch = new URL(request.url).searchParams.get("batch");
  if (!batch || !/^\d+$/.test(batch)) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const snapshot = await refreshVodSnapshot(Number(batch));
    return NextResponse.json({ ok: true, batch: Number(batch), refreshedAt: snapshot.refreshedAt, vodCount: snapshot.vods.length, failureCount: snapshot.failures.length });
  } catch (error) {
    if (error instanceof VodRefreshBatchError) return NextResponse.json({ ok: false }, { status: 400 });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
