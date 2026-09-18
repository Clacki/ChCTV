"use client";

import { Badge } from "@/components/ui/badge";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type Modifier,
} from "@dnd-kit/core";
import { ExternalLink, Radio } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { DiscoveryBrowser } from "@/features/discovery/discovery-browser";
import { useParticipantBroadcasts } from "@/features/discovery/use-participant-broadcasts";
import { MultiviewController } from "@/features/multiview/multiview-controller";
import { multiviewSelectionLimit, useMultiviewSelection } from "@/features/multiview/use-multiview-selection";
import { getBongnudoScheduleStatus } from "@/lib/bongnudo-schedule";
import { isRisingAvailable } from "@/lib/participant-broadcast-refresh-policy";
import { cn } from "@/lib/utils";
import type { StreamCardData } from "@/types/stream-card";

const selectionDropZoneId = "selection-drop-zone";

const restrictSelectedStreamToVerticalAxis: Modifier = ({ active, transform }) =>
  active?.data.current?.type === "selected-stream" ? { ...transform, x: 0 } : transform;

export function DiscoveryMultiviewWorkspace() {
  const { streams, members, status, risingHistoryReady, scheduleStatus, retry } = useParticipantBroadcasts();
  const selectionState = useMultiviewSelection();
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [isSelectionDropZoneActive, setIsSelectionDropZoneActive] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const activeData = active.data.current;
    const overData = over?.data.current;

    if (activeData?.type === "discovery-stream") {
      if (over?.id === selectionDropZoneId || overData?.type === "selected-stream") {
        selectionState.addStream(activeData.streamId as string);
      }
    } else if (activeData?.type === "selected-stream" && overData?.type === "selected-stream") {
      selectionState.moveStream(activeData.streamId as string, overData.streamId as string);
    }

    setActiveStreamId(null);
    setIsSelectionDropZoneActive(false);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveStreamId(
      active.data.current?.type === "discovery-stream" ? (active.data.current.streamId as string) : null,
    );
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    setIsSelectionDropZoneActive(
      active.data.current?.type === "discovery-stream" &&
        (over?.id === selectionDropZoneId || over?.data.current?.type === "selected-stream"),
    );
  };

  const handleDragCancel = () => {
    setActiveStreamId(null);
    setIsSelectionDropZoneActive(false);
  };

  const activeStream = activeStreamId ? streams.find((stream) => stream.id === activeStreamId) : undefined;
  const liveChannelCount = streams.filter((stream) => stream.isLive).length;
  const schedule = getBongnudoScheduleStatus();
  const isLive = schedule.status === "OPEN" && status === "success" && liveChannelCount > 0;
  const isChecking = schedule.status === "OPEN" && (status === "loading" || status === "error");
  const isReady = schedule.status === "OPEN" && status === "success" && liveChannelCount === 0;
  const statusLabel = isLive ? "LIVE" : isReady ? "READY" : isChecking ? "CHECKING" : "OFF AIR";

  return (
    <DndContext
      id="discovery-multiview-dnd"
      sensors={sensors}
      modifiers={[restrictSelectedStreamToVerticalAxis]}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <header className="flex min-h-14 shrink-0 items-center gap-4 border-b bg-card px-6 py-2">
        <Image
          src="/logo.png"
          alt="ChCTV"
          width={150}
          height={50}
          priority
          className="h-10 w-auto shrink-0 object-contain"
        />
        <div aria-live="polite" className="hidden min-w-0 items-center md:flex">
          <div
            aria-label={`봉누도 ${statusLabel}`}
            className={cn(
              "inline-flex h-9 shrink-0 overflow-hidden rounded-md border bg-gradient-to-b from-muted to-card",
              isLive ? "border-primary/60" : "border-border",
            )}
          >
            <span
              className={cn(
                "relative flex w-8 items-center justify-center border-r",
                isLive ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-card text-tertiary",
              )}
            >
              <Radio aria-hidden="true" className="size-4" />
              {isLive && <span aria-hidden="true" className="absolute right-1 top-1 size-1.5 rounded-full bg-live" />}
            </span>
            <span className="flex items-center gap-2 px-2.5">
              <span className="text-sm font-semibold text-foreground">봉누도</span>
              <span
                className={cn(
                  "w-[4.75rem] text-center text-[10px] font-semibold tracking-[0.14em]",
                  isLive ? "text-primary" : "text-tertiary",
                )}
              >
                {statusLabel}
              </span>
            </span>
          </div>
        </div>
        <nav
          aria-label="봉누도 외부 링크"
          className="ml-auto hidden shrink-0 items-center gap-5 text-sm font-medium text-muted-foreground lg:flex"
        >
          <a
            href="https://www.bongnudo.site/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-foreground/85 hover:text-primary hover:underline hover:underline-offset-4"
          >
            공식 위키
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </a>
          <a
            href="https://bnd2-fanwiki.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-foreground/85 hover:text-primary hover:underline hover:underline-offset-4"
          >
            봉누도 따라가기
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </a>
        </nav>
      </header>
      <main className="grid flex-1 grid-cols-1 gap-4 p-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-label="봉누도 방송 탐색" className="min-h-80 min-w-0 rounded-xl border bg-card p-6">
          <DiscoveryBrowser
            members={members}
            selection={selectionState.selection}
            selectionLimit={multiviewSelectionLimit}
            onAddStream={selectionState.addStream}
            isLoading={status === "loading"}
            hasError={status === "error"}
            risingHistoryReady={risingHistoryReady}
            risingEnabled={isRisingAvailable(scheduleStatus)}
            onRetry={retry}
          />
        </section>

        <aside
          aria-label="멀티뷰 컨트롤러"
          className="self-start overflow-hidden rounded-xl border bg-card lg:sticky lg:top-20 lg:h-[calc(100dvh-5rem)]"
        >
          <MultiviewController
            streams={streams}
            selection={selectionState.selection}
            selectionLimit={multiviewSelectionLimit}
            onRemoveStream={selectionState.removeStream}
            onMoveStreamByOffset={selectionState.moveStreamByOffset}
            onClearSelection={selectionState.clearSelection}
            onReplaceSelection={selectionState.replaceSelection}
            isDragOver={isSelectionDropZoneActive}
            dropZoneId={selectionDropZoneId}
          />
        </aside>
      </main>
      <DragOverlay dropAnimation={null}>{activeStream && <DiscoveryDragPreview stream={activeStream} />}</DragOverlay>
    </DndContext>
  );
}

function DiscoveryDragPreview({ stream }: Readonly<{ stream: StreamCardData }>) {
  return (
    <article className="w-72 cursor-grabbing overflow-hidden rounded-xl border border-primary bg-card shadow-xl ring-1 ring-primary/35 scale-[1.02]">
      <div className="relative aspect-video bg-muted">
        {stream.thumbnailUrl && <Image src={stream.thumbnailUrl} alt="" fill unoptimized className="object-cover" />}
        {stream.isLive && (
          <Badge variant="live" className="absolute left-3 top-3">
            LIVE
          </Badge>
        )}
      </div>
      <div className="min-w-0 px-3 py-2">
        <p className="truncate text-sm font-semibold">{stream.streamerName}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{stream.title}</p>
      </div>
    </article>
  );
}
