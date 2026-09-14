"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  type DragOverEvent,
  type DragStartEvent,
  type DragEndEvent,
  type Modifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useState } from "react";

import { DiscoveryBrowser } from "@/features/discovery/discovery-browser";
import { MultiviewController } from "@/features/multiview/multiview-controller";
import {
  multiviewSelectionLimit,
  useMultiviewSelection,
} from "@/features/multiview/use-multiview-selection";
import type { Participant } from "@/types/participant";
import type { StreamCardData } from "@/types/stream-card";

const selectionDropZoneId = "selection-drop-zone";

const restrictSelectedStreamToVerticalAxis: Modifier = ({ active, transform }) => (
  active?.data.current?.type === "selected-stream" ? { ...transform, x: 0 } : transform
);

type DiscoveryMultiviewWorkspaceProps = {
  streams: readonly StreamCardData[];
  participants: readonly Participant[];
};

export function DiscoveryMultiviewWorkspace({ streams, participants }: DiscoveryMultiviewWorkspaceProps) {
  const selectionState = useMultiviewSelection();
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [isSelectionDropZoneActive, setIsSelectionDropZoneActive] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

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
    setActiveStreamId(active.data.current?.type === "discovery-stream" ? active.data.current.streamId as string : null);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    setIsSelectionDropZoneActive(
      active.data.current?.type === "discovery-stream"
      && (over?.id === selectionDropZoneId || over?.data.current?.type === "selected-stream"),
    );
  };

  const handleDragCancel = () => {
    setActiveStreamId(null);
    setIsSelectionDropZoneActive(false);
  };

  const activeStream = activeStreamId ? streams.find((stream) => stream.id === activeStreamId) : undefined;

  return (
    <DndContext id="discovery-multiview-dnd" sensors={sensors} modifiers={[restrictSelectedStreamToVerticalAxis]} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
      <main className="grid flex-1 grid-cols-1 gap-4 p-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="discovery-heading" className="min-h-80 min-w-0 rounded-xl border bg-card p-6">
          <h1 id="discovery-heading" className="text-base font-medium">봉누도 상황실</h1>
          <DiscoveryBrowser
            streams={streams}
            participants={participants}
            selection={selectionState.selection}
            selectionLimit={multiviewSelectionLimit}
            onAddStream={selectionState.addStream}
          />
        </section>

        <aside
          aria-label="멀티뷰 컨트롤러"
          className="self-start overflow-hidden rounded-xl border bg-card lg:sticky lg:top-20 lg:h-[calc(100dvh-5rem)]"
        >
          <MultiviewController
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
      <DragOverlay dropAnimation={null}>
        {activeStream && <DiscoveryDragPreview stream={activeStream} />}
      </DragOverlay>
    </DndContext>
  );
}

function DiscoveryDragPreview({ stream }: Readonly<{ stream: StreamCardData }>) {
  return (
    <article className="w-72 cursor-grabbing overflow-hidden rounded-xl border border-primary bg-card shadow-xl ring-1 ring-primary/35 scale-[1.02]">
      <div className="relative aspect-video bg-muted">
        {stream.thumbnailUrl && <Image src={stream.thumbnailUrl} alt="" fill unoptimized className="object-cover" />}
        {stream.isLive && <Badge variant="live" className="absolute left-3 top-3">LIVE</Badge>}
      </div>
      <div className="min-w-0 px-3 py-2">
        <p className="truncate text-sm font-semibold">{stream.streamerName}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{stream.title}</p>
      </div>
    </article>
  );
}
