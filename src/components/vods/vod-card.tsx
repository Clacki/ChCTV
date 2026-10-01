"use client";

import Image from "next/image";
import { ExternalLink, ImageOff } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/tag";
import { formatVodDuration, formatVodPublishedAt } from "@/lib/vod-display";
import { cn } from "@/lib/utils";
import type { VodListItem } from "@/server/vods/vod-read-model";

type VodCardProps = { item: VodListItem };

export function VodCard({ item }: VodCardProps) {
  const [thumbnailStatus, setThumbnailStatus] = useState<"loading" | "loaded" | "error">("loading");
  const hasThumbnail = Boolean(item.thumbnailUrl) && thumbnailStatus !== "error";
  const participant = item.participant;
  const publishedAt = new Date(item.publishedAt);

  return (
    <article className="group min-w-0 overflow-hidden rounded-xl border border-border/80 bg-muted/70 transition-colors hover:border-border-strong hover:bg-muted">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${item.title} 다시보기 열기`}
        className="block cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <div className="relative aspect-video overflow-hidden bg-muted">
          {hasThumbnail && item.thumbnailUrl ? (
            <Image
              src={item.thumbnailUrl}
              alt=""
              width={640}
              height={360}
              unoptimized
              className={cn("size-full object-cover transition duration-200 group-hover:scale-[1.02]", thumbnailStatus === "loaded" ? "opacity-100" : "opacity-0")}
              onLoad={() => setThumbnailStatus("loaded")}
              onError={() => setThumbnailStatus("error")}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff aria-hidden="true" className="size-6" />
              <span className="text-xs">썸네일 없음</span>
            </div>
          )}
          {hasThumbnail && thumbnailStatus === "loading" && <div className="absolute inset-0 animate-pulse bg-border/70 motion-reduce:animate-none" />}
          <Badge variant="neutral" className="absolute right-2 bottom-2 bg-background/90 px-1.5 py-0.5 tabular-nums">
            {formatVodDuration(item.duration)}
          </Badge>
          <ExternalLink aria-hidden="true" className="absolute top-2 right-2 size-4 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" />
        </div>
        <div className="p-3">
          <h2 className="line-clamp-2 min-h-10 text-sm leading-5 font-semibold tracking-[-0.01em] text-foreground" title={item.title}>{item.title}</h2>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-tertiary">
            {participant ? <p className="min-w-0 truncate font-medium text-foreground/85">{participant.name}</p> : <span />}
            <time className="shrink-0" dateTime={publishedAt.toISOString()}>등록 {formatVodPublishedAt(publishedAt.getTime())}</time>
          </div>
          {participant && participant.affiliations.length > 0 && (
            <ul aria-label={`${participant.name} 소속`} className="mt-2 flex h-5 items-center gap-1 overflow-hidden">
              {participant.affiliations.slice(0, 3).map((affiliation) => (
                <li key={affiliation} className="min-w-0"><Tag className="max-w-28 truncate" title={affiliation}>{affiliation}</Tag></li>
              ))}
            </ul>
          )}
        </div>
      </a>
    </article>
  );
}
