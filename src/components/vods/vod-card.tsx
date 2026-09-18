"use client";

import Image from "next/image";
import { Eye, ImageOff } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/tag";
import { formatVodDuration, formatVodPublishedAt, formatVodViewCount, type VodDisplayItem } from "@/lib/vod-display";
import { cn } from "@/lib/utils";

export function VodCard({ vod, participant }: VodDisplayItem) {
  const [thumbnailStatus, setThumbnailStatus] = useState<"loading" | "loaded" | "error">("loading");
  const hasThumbnail = Boolean(vod.thumbnailUrl) && thumbnailStatus !== "error";
  const displayName = participant?.streamerName ?? vod.channelName;
  const affiliations = participant?.affiliations.slice(0, 2) ?? [];

  return <article className="group min-w-0 overflow-hidden rounded-xl border border-border/80 bg-muted/70 transition-colors hover:border-border-strong hover:bg-muted">
    <a href={`https://chzzk.naver.com/video/${vod.videoNo}`} target="_blank" rel="noopener noreferrer" aria-label={`${displayName}의 다시보기: ${vod.title}`} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {hasThumbnail && vod.thumbnailUrl ? <Image src={vod.thumbnailUrl} alt="" width={640} height={360} unoptimized className={cn("size-full object-cover transition-opacity", thumbnailStatus === "loaded" ? "opacity-100" : "opacity-0")} onLoad={() => setThumbnailStatus("loaded")} onError={() => setThumbnailStatus("error")} /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground"><ImageOff aria-hidden="true" className="size-6" /><span className="text-xs">썸네일 없음</span></div>}
        {hasThumbnail && thumbnailStatus === "loading" && <div className="absolute inset-0 animate-pulse bg-border/70 motion-reduce:animate-none" />}
        <Badge variant="neutral" className="absolute right-2 bottom-2 bg-background/90 px-1.5 py-0.5 tabular-nums">{formatVodDuration(vod.duration)}</Badge>
      </div>
      <div className="p-3">
        <h2 className="line-clamp-2 min-h-10 text-sm leading-5 font-semibold tracking-[-0.01em] text-foreground" title={vod.title}>{vod.title}</h2>
        <div className="mt-2 flex min-w-0 items-center gap-2"><Avatar src={vod.channelImageUrl} alt={`${displayName} 채널 이미지`} fallback={displayName} size="sm" /><p className="min-w-0 truncate text-sm leading-4 text-muted-foreground" title={participant?.rpName ? `${displayName} · RP ${participant.rpName}` : displayName}><span className="font-medium text-foreground/85">{displayName}</span>{participant?.rpName && <span className="text-tertiary"> · RP {participant.rpName}</span>}</p></div>
        {affiliations.length > 0 && <ul aria-label={`${displayName} 소속`} className="mt-2 flex h-5 items-center gap-1 overflow-hidden">{affiliations.map((affiliation) => <li key={`${affiliation.type}:${affiliation.name}`} className="min-w-0"><Tag className="max-w-28 truncate" title={affiliation.name}>{affiliation.name}</Tag></li>)}</ul>}
        <p className="mt-2 flex items-center gap-1.5 text-xs text-tertiary"><Eye aria-hidden="true" className="size-3" /><span>조회수 {formatVodViewCount(vod.viewCount)}</span><span aria-hidden="true">·</span><time dateTime={new Date(vod.publishedAt).toISOString()}>{formatVodPublishedAt(vod.publishedAt)}</time></p>
      </div>
    </a>
  </article>;
}
