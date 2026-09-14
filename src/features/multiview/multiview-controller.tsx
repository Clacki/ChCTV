"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bookmark, GripVertical, Play, RotateCcw, Trash2, X } from "lucide-react";
import { useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mockStreams } from "@/data/mock-streams";
import { cn } from "@/lib/utils";
import { useSavedMultiviews } from "@/features/multiview/use-saved-multiviews";

const streamsById = new Map(mockStreams.map((stream) => [stream.id, stream]));

type MultiviewControllerProps = {
  selection: readonly string[];
  selectionLimit: number;
  dropZoneId: string;
  onRemoveStream: (streamId: string) => void;
  onMoveStreamByOffset: (streamId: string, offset: number) => void;
  onClearSelection: () => void;
  onReplaceSelection: (streamIds: readonly string[]) => void;
  isDragOver: boolean;
};

export function MultiviewController({
  selection,
  selectionLimit,
  dropZoneId,
  onRemoveStream,
  onMoveStreamByOffset,
  onClearSelection,
  onReplaceSelection,
  isDragOver,
}: MultiviewControllerProps) {
  const { isOver, setNodeRef } = useDroppable({ id: dropZoneId, data: { type: "selection-drop-zone" } });
  const { savedMultiviews, saveMultiview, removeMultiview } = useSavedMultiviews();
  const [savedMultiviewName, setSavedMultiviewName] = useState("");
  const [saveFeedback, setSaveFeedback] = useState("");
  const isDropZoneActive = isOver || isDragOver;

  const loadSavedMultiview = (streamIds: readonly string[]) => {
    onReplaceSelection(streamIds.filter((streamId) => streamsById.has(streamId)));
  };

  const canSave = selection.length > 0 && savedMultiviewName.trim().length > 0;

  const handleSave = () => {
    const result = saveMultiview(savedMultiviewName, selection);

    if (result === "saved") {
      setSavedMultiviewName("");
      setSaveFeedback("");
    } else if (result === "duplicate") {
      setSaveFeedback("이미 같은 이름의 묶음이 있습니다.");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-x-hidden">
      <header className="p-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">멀티뷰 리모컨</h2>
          <span className="shrink-0 text-sm font-medium text-primary">{selection.length} / {selectionLimit} 선택</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">선택한 방송의 순서를 조정하세요.</p>
      </header>

      <section
        ref={setNodeRef}
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-x-hidden px-4 transition-colors",
          isDropZoneActive && "rounded-md border border-primary/70 bg-primary/10 ring-1 ring-primary/30",
        )}
        aria-labelledby="current-selection-heading"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 id="current-selection-heading" className="text-sm font-medium">현재 선택</h3>
          <span className="shrink-0 text-xs text-muted-foreground">{selection.length} / {selectionLimit}</span>
        </div>

        {selection.length > 0 ? (
          <SortableContext items={selection.map((streamId) => `selected:${streamId}`)} strategy={verticalListSortingStrategy}>
            <ol className="mt-2 flex min-h-0 w-full max-w-full flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto pr-1">
              {selection.map((streamId, index) => {
                const stream = streamsById.get(streamId);

                return stream ? (
                  <SortableSelectedStreamItem
                    key={stream.id}
                    streamId={stream.id}
                    index={index}
                    streamerName={stream.streamerName}
                    rpName={stream.rpName}
                    channelImageUrl={stream.channelImageUrl}
                    onMove={onMoveStreamByOffset}
                    onRemove={() => onRemoveStream(stream.id)}
                  />
                ) : null;
              })}
            </ol>
          </SortableContext>
        ) : (
          <div className={cn("mt-2 flex flex-1 items-center justify-center rounded-md border border-dashed px-5 py-6 text-center text-sm text-muted-foreground", isDropZoneActive && "border-primary bg-primary/5 text-foreground")}>
            <p>
              선택한 방송이 없습니다.
              <br />
              왼쪽 방송의 <span className="font-medium text-foreground">+ 추가</span>를 누르거나 카드를 이곳으로 드래그하세요.
            </p>
          </div>
        )}
      </section>

      <div className="px-4 pb-4 pt-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <Button type="button" size="md" disabled={selection.length === 0}>
            <Play aria-hidden="true" className="size-4" />멀티뷰 시작
          </Button>
          <Button type="button" variant="outline" size="md" onClick={onClearSelection} disabled={selection.length === 0}>
            <RotateCcw aria-hidden="true" className="size-4" />초기화
          </Button>
        </div>
      </div>

      <section className="border-t p-4" aria-labelledby="save-multiview-heading">
        <div className="flex items-center gap-2">
          <Bookmark aria-hidden="true" className="size-4 text-primary" />
          <h3 id="save-multiview-heading" className="text-sm font-medium">멀티뷰 묶음 저장</h3>
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            handleSave();
          }}
        >
          <label className="sr-only" htmlFor="multiview-name">묶음 이름</label>
          <input
            id="multiview-name"
            value={savedMultiviewName}
            onChange={(event) => {
              setSavedMultiviewName(event.target.value);
              setSaveFeedback("");
            }}
            maxLength={40}
            className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none placeholder:text-tertiary focus:border-border-strong focus:outline-2 focus:outline-offset-2 focus:outline-primary"
            placeholder="묶음 이름"
          />
          <Button type="submit" variant="secondary" size="md" disabled={!canSave}>저장</Button>
        </form>
        <p aria-live="polite" className="mt-1 min-h-4 text-xs text-live">{saveFeedback}</p>
      </section>

      <section className="min-h-0 px-4 pb-4 pt-3" aria-labelledby="saved-multiviews-heading">
        <h3 id="saved-multiviews-heading" className="text-sm font-medium">저장된 묶음 <span className="text-primary">{savedMultiviews.length}개</span></h3>
        <ul className="mt-2 max-h-36 divide-y overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable] [scrollbar-width:thin]">
          {savedMultiviews.map((multiview) => {
            const status = getSavedMultiviewStatus(multiview.streamIds);

            return (
              <li key={multiview.id} className="flex min-w-0 items-center gap-1 py-1">
                <button
                  type="button"
                  onClick={() => loadSavedMultiview(multiview.streamIds)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-sm px-2 py-1 text-left hover:bg-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
                  aria-label={`${multiview.name} 불러오기`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{multiview.name}</span>
                    <span className="block text-xs text-muted-foreground">{status.channelCount}개 채널 · <span className="text-live">{status.liveCount} LIVE</span></span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeMultiview(multiview.id);
                  }}
                  aria-label={`${multiview.name} 삭제`}
                  className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-tertiary hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function SortableSelectedStreamItem({
  streamId,
  index,
  streamerName,
  rpName,
  channelImageUrl,
  onMove,
  onRemove,
}: Readonly<{
  streamId: string;
  index: number;
  streamerName: string;
  rpName: string | null;
  channelImageUrl: string | null;
  onMove: (streamId: string, offset: number) => void;
  onRemove: () => void;
}>) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: `selected:${streamId}`,
    data: { type: "selected-stream", streamId },
  });
  const style = {
    transform: CSS.Transform.toString({
      x: 0,
      y: transform?.y ?? 0,
      scaleX: transform?.scaleX ?? 1,
      scaleY: transform?.scaleY ?? 1,
    }),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} className={cn("w-full max-w-full", isDragging && "relative z-10 opacity-60")}>
      <div className="flex w-full max-w-full min-w-0 items-center gap-2 rounded-md border bg-muted/60 px-2 py-2">
        <button
          type="button"
          aria-label={`${streamerName} 순서 변경`}
          className="inline-flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-tertiary hover:bg-card hover:text-foreground active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onKeyDown={(event) => {
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              event.preventDefault();
              onMove(streamId, event.key === "ArrowUp" ? -1 : 1);
            }
          }}
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" className="size-4" />
        </button>
        <span className="w-4 shrink-0 text-center font-mono text-xs text-tertiary">{index + 1}</span>
        <Avatar src={channelImageUrl} alt={`${streamerName} 채널 이미지`} fallback={streamerName} size="sm" className="size-7 text-[10px]" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{streamerName}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">RP: {rpName ?? "정보 없음"}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${streamerName} 선택 해제`}
          className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-tertiary hover:bg-card hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </li>
  );
}

function getSavedMultiviewStatus(streamIds: readonly string[]) {
  const streams = streamIds
    .map((streamId) => streamsById.get(streamId))
    .filter((stream): stream is (typeof mockStreams)[number] => stream !== undefined);

  return {
    channelCount: streamIds.length,
    liveCount: streams.filter((stream) => stream.isLive).length,
  };
}
