import { getParticipants } from "@/lib/participants";
import type { Participant } from "@/types/participant";
import type { Vod } from "@/types/vod";

export type VodDisplayItem = { vod: Vod; participant: Participant | null };

export function createVodDisplayItems(vods: readonly Vod[], participants: readonly Participant[] = getParticipants()): VodDisplayItem[] {
  const byChannelId = new Map(participants.flatMap((participant) => participant.channelId ? [[participant.channelId, participant] as const] : []));
  return [...vods].sort((left, right) => right.publishedAt - left.publishedAt).map((vod) => ({ vod, participant: byChannelId.get(vod.channelId) ?? null }));
}

export function formatVodDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = total % 60;
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}` : `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export function formatVodViewCount(viewCount: number): string {
  if (viewCount >= 10_000) return `${(Math.floor((viewCount / 10_000) * 10) / 10).toLocaleString("ko-KR")}만`;
  return viewCount.toLocaleString("ko-KR");
}

export function formatVodPublishedAt(publishedAt: number): string {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(publishedAt));
}
