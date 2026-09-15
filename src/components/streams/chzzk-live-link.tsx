"use client";

import { useId, useState } from "react";

import { ChzzkIcon } from "@/components/common/chzzk-icon";
import { buttonVariants } from "@/components/ui/button";
import { getChzzkLiveUrl } from "@/features/multiview/chzzk-viewer";
import { cn } from "@/lib/utils";

export function ChzzkLiveLink({
  channelId,
  streamerName,
}: Readonly<{ channelId: string; streamerName: string }>) {
  const tooltipId = useId();
  const [dismissed, setDismissed] = useState(false);

  return (
    <span
      className="group/chzzk relative inline-flex shrink-0"
      onMouseEnter={() => setDismissed(false)}
      onFocus={() => setDismissed(false)}
    >
      <a
        href={getChzzkLiveUrl(channelId)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${streamerName} 방송 치지직에서 보기 (새 탭)`}
        aria-describedby={tooltipId}
        draggable={false}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        onAuxClick={(event) => event.stopPropagation()}
        onDragStart={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "Escape") setDismissed(true);
        }}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "size-7 rounded-sm border border-transparent p-0 text-chzzk hover:border-chzzk/25 hover:bg-chzzk/10",
        )}
      >
        <ChzzkIcon />
      </a>
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          "invisible absolute right-0 bottom-full z-10 w-max pb-1",
          !dismissed && "group-hover/chzzk:visible group-focus-within/chzzk:visible",
        )}
      >
        <span className="block rounded border border-border bg-background px-2 py-1 text-xs text-foreground shadow-sm">
          치지직에서 보기
        </span>
      </span>
    </span>
  );
}
