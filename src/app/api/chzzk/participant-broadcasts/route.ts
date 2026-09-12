import { getCachedParticipantBroadcasts } from "@/server/chzzk/participant-broadcast-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getCachedParticipantBroadcasts();

  if (result.status === "error") {
    return Response.json(result, { status: 503 });
  }

  return Response.json(result);
}
