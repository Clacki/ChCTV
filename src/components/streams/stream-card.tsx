"use client";

import Image from "next/image";
import { Check, Eye, ImageOff, Plus } from "lucide-react";
import { useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";
import type { StreamCardData } from "@/types/stream-card";

type StreamCardProps = {
  stream: StreamCardData;
  selected?: boolean;
  onAdd?: () => void;
  addDisabled?: boolean;
  draggable?: boolean;
};

export function StreamCard({
  stream,
  selected = false,
  onAdd,
  addDisabled = false,
  draggable = false,
}: StreamCardProps) {
  const [thumbnail, setThumbnail] = useState<{
    src: string | null;
    status: "loading" | "loaded" | "error";
  }>({ src: stream.thumbnailUrl, status: "loading" });

  const thumbnailStatus = !stream.thumbnailUrl
    ? "error"
    : thumbnail.src === stream.thumbnailUrl
      ? thumbnail.status
      : "loading";
  const visibleTags = stream.tags.slice(0, 3);
  const hiddenTags = stream.tags.slice(3);
  const cornerMarkerClass = cn(
    "pointer-events-none absolute size-4 transition-colors group-hover:border-white/85",
    selected ? "border-primary/80 group-hover:border-primary" : "border-white/60",
  );

  return (
    <article
      aria-label={`${stream.streamerName} 방송`}
      className={cn(
        "group min-w-0 overflow-hidden rounded-xl border bg-card",
        selected
          ? "border-primary ring-1 ring-primary/35 hover:border-primary hover:ring-primary/60"
          : "hover:border-border-strong",
        draggable && "cursor-grab active:cursor-grabbing",
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {thumbnailStatus === "loading" && (
          <div role="status" className="absolute inset-0">
            <Skeleton className="size-full rounded-none bg-border" />
            <span className="sr-only">썸네일을 불러오는 중</span>
          </div>
        )}
        {thumbnailStatus === "error" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff aria-hidden="true" className="size-6" />
            <p className="text-xs">썸네일을 표시할 수 없어요</p>
          </div>
        ) : (
          stream.thumbnailUrl && (
            <Image
              key={stream.thumbnailUrl}
              src={stream.thumbnailUrl}
              alt=""
              width={640}
              height={360}
              unoptimized
              className={cn(
                "absolute inset-0 size-full object-cover",
                thumbnailStatus === "loaded" ? "opacity-100" : "opacity-0",
              )}
              onLoad={() => setThumbnail({ src: stream.thumbnailUrl, status: "loaded" })}
              onError={() => setThumbnail({ src: stream.thumbnailUrl, status: "error" })}
            />
          )
        )}

        <span aria-hidden="true" className={cn(cornerMarkerClass, "top-2 left-2 border-t border-l")} />
        <span aria-hidden="true" className={cn(cornerMarkerClass, "top-2 right-2 border-t border-r")} />
        <span aria-hidden="true" className={cn(cornerMarkerClass, "bottom-2 left-2 border-b border-l")} />
        <span aria-hidden="true" className={cn(cornerMarkerClass, "right-2 bottom-2 border-r border-b")} />

        {stream.isLive && (
          <>
            <Badge variant="live" className="absolute top-3 left-3">
              LIVE
            </Badge>
            <span className="absolute right-3 bottom-3 flex items-center gap-1 rounded bg-background/85 px-2 py-1 text-xs font-medium text-foreground tabular-nums">
              <Eye aria-hidden="true" className="size-3" />
              <span className="sr-only">시청자 </span>
              {stream.viewerCount.toLocaleString("ko-KR")}
              <span className="sr-only">명</span>
            </span>
          </>
        )}
        {selected ? (
          <Badge variant="neutral" aria-label="추가됨" className="absolute top-3 right-3 gap-1 border border-primary bg-background/90 text-primary">
            <Check aria-hidden="true" className="size-3" />
            추가됨
          </Badge>
        ) : (
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onAdd?.();
            }}
            disabled={addDisabled || !onAdd}
            aria-label={`${stream.streamerName} 선택에 추가`}
            className="absolute top-3 right-3 inline-flex h-7 cursor-pointer items-center gap-1 rounded-sm border border-border bg-background/85 px-2 text-xs font-medium text-foreground hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus aria-hidden="true" className="size-3" />
            {addDisabled ? "최대 선택" : "추가"}
          </button>
        )}
      </div>

      <div className="flex flex-col px-3 py-2">
        <div className="flex h-8 min-w-0 items-center gap-2">
          <Avatar src={stream.channelImageUrl} alt={`${stream.streamerName} 채널 이미지`} size="sm" />
          <p className="min-w-0 truncate text-sm leading-4" title={`${stream.streamerName} · RP ${stream.rpName ?? "정보 없음"}`}>
            <span className="font-semibold">{stream.streamerName}</span>
            <span className="text-tertiary"> · RP </span>
            <span className="text-muted-foreground">{stream.rpName ?? "정보 없음"}</span>
          </p>
        </div>
        <h2 className="mt-1 line-clamp-1 h-5 text-sm leading-5 font-semibold" title={stream.title}>
          {stream.title}
        </h2>
        <div className="mt-1 flex h-5 min-w-0 items-center gap-2 text-xs text-muted-foreground">
          {stream.category && (
            <p className="max-w-24 shrink-0 truncate" title={stream.category}>
              <span className="sr-only">카테고리 </span>
              {stream.category}
            </p>
          )}
          <ul aria-label="방송 태그" className="flex min-w-0 items-center gap-2">
            {visibleTags.map((tag) => (
              <li key={tag} className="min-w-0">
                <Tag className="max-w-24 truncate" title={`#${tag}`}>
                  #{tag}
                </Tag>
              </li>
            ))}
            {hiddenTags.length > 0 && (
              <li className="shrink-0">
                <Tag
                  className="tabular-nums"
                  aria-label={`추가 태그 ${hiddenTags.length}개: ${hiddenTags.join(", ")}`}
                  title={hiddenTags.map((tag) => `#${tag}`).join(" ")}
                >
                  +{hiddenTags.length}
                </Tag>
              </li>
            )}
          </ul>
        </div>
      </div>
    </article>
  );
}

export function StreamCardSkeleton() {
  return (
    <div aria-hidden="true" className="min-w-0 overflow-hidden rounded-xl border bg-card">
      <div aria-hidden="true">
        <Skeleton className="aspect-video rounded-none" />
        <div className="flex flex-col px-3 py-2">
          <div className="flex h-8 items-center gap-2">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="mt-1 flex h-5 items-center">
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="mt-1 flex h-5 items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
