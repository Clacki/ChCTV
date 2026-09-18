import { NextResponse } from "next/server";
import { refreshVodSnapshot } from "@/server/vods/refresh-vod-snapshot";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.VOD_REFRESH_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });

  try {
    const snapshot = await refreshVodSnapshot();
    return NextResponse.json({ ok: true, refreshedAt: snapshot.refreshedAt, vodCount: snapshot.vods.length, failureCount: snapshot.failures.length });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
