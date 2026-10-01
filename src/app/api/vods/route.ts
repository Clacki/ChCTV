import { readVods } from "@/server/vods/read-vods";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await readVods());
  } catch {
    console.error("[VOD read] failed");
    return Response.json({ ok: false }, { status: 500 });
  }
}
