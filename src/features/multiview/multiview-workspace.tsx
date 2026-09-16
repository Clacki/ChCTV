"use client";

import { Columns2, Crown, LayoutGrid, MessageSquare, Rows2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ChzzkChat, ChzzkViewer } from "@/features/multiview/chzzk-viewer";
import {
  getDefaultMultiviewLayoutPreset,
  getMultiviewLayout,
  type MultiviewLayoutPreset,
} from "@/features/multiview/multiview-layout";
import {
  createMultiviewSlots,
  getMultiviewChannelIds,
  getMultiviewSlotGridArea,
  getMultiviewSlotLabelByKey,
  getMultiviewSlotKeyByChannelId,
  removeMultiviewSlotChannel,
  swapMainWithSub,
} from "@/features/multiview/multiview-slot";
import { getMultiviewUrl } from "@/features/multiview/multiview-url";
import { getViewerGeometry } from "@/features/multiview/viewer-geometry";
import { cn } from "@/lib/utils";

const VIEWER_GAP = 0;

const layoutControls: ReadonlyArray<{ preset: MultiviewLayoutPreset; label: string; icon: typeof Columns2 }> = [
  { preset: "focus-right", label: "Focus Right", icon: Columns2 },
  { preset: "focus-bottom", label: "Focus Bottom", icon: Rows2 },
  { preset: "balanced", label: "Balanced", icon: LayoutGrid },
];

export function MultiviewWorkspace({ channelIds }: Readonly<{ channelIds: readonly string[] }>) {
  const [layoutPreset, setLayoutPreset] = useState<MultiviewLayoutPreset>(() => getDefaultMultiviewLayoutPreset(channelIds.length));
  const [slots, setSlots] = useState(() => createMultiviewSlots(channelIds));
  const activeChannelIds = getMultiviewChannelIds(slots);
  const layout = getMultiviewLayout(activeChannelIds.length, layoutPreset);
  const visibleLayoutControls = activeChannelIds.length === 2
    ? layoutControls.filter(({ preset }) => preset !== "balanced")
    : layoutControls;
  const mainChannelId = slots.main;
  const [showViewerTip, setShowViewerTip] = useState(true);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const viewerSectionRef = useRef<HTMLElement>(null);
  const [viewerBounds, setViewerBounds] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setShowViewerTip(false), 6000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const viewerSection = viewerSectionRef.current;
    if (!viewerSection) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setViewerBounds({ width: entry.contentRect.width, height: entry.contentRect.height });
    });

    observer.observe(viewerSection);
    return () => observer.disconnect();
  }, []);

  const viewerGeometry = getViewerGeometry({
    preset: layoutPreset,
    channelCount: activeChannelIds.length,
    width: viewerBounds.width,
    height: viewerBounds.height,
    gap: VIEWER_GAP,
    columnWeights: layout.columnWeights,
    rowWeights: layout.rowWeights,
  });

  const removeChannel = (channelId: string) => {
    const nextSlots = removeMultiviewSlotChannel(slots, channelId);
    const nextChannelIds = getMultiviewChannelIds(nextSlots);

    setSlots(nextSlots);
    window.history.replaceState(null, "", getMultiviewUrl(nextChannelIds));
  };

  if (activeChannelIds.length === 0) {
    return (
      <main className="min-h-dvh p-6">
        <section className="mx-auto max-w-3xl rounded-xl border bg-card p-6">
          <h1 className="text-xl font-semibold">Multiview</h1>
          <p className="mt-6 text-sm text-muted-foreground">선택한 방송이 없습니다.</p>
          <Link href="/" className="mt-3 inline-flex text-primary underline underline-offset-4">선택 페이지로 이동</Link>
        </section>
      </main>
    );
  }

  return (
    <main className={cn(
      "grid h-dvh w-screen min-h-0 min-w-0 gap-2 overflow-hidden p-2",
      isChatVisible ? "grid-cols-[minmax(0,1fr)_360px]" : "grid-cols-[minmax(0,1fr)]",
    )}>
      <section ref={viewerSectionRef} className="relative min-h-0 min-w-0 overflow-hidden" aria-label="Viewer 영역">
        <div className="absolute right-2 top-2 z-20 flex items-center gap-1 rounded-md border bg-card/90 p-1 backdrop-blur" aria-label="레이아웃 선택">
              {visibleLayoutControls.map(({ preset, label, icon: Icon }) => (
                <Button
                  key={preset}
                  type="button"
                  size="sm"
                  variant={layoutPreset === preset ? "secondary" : "ghost"}
                  aria-pressed={layoutPreset === preset}
                  onClick={() => setLayoutPreset(preset)}
                  title={label}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  <span className="sr-only">{label}</span>
                </Button>
              ))}
              {!isChatVisible && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label="Open Main Chat"
                  onClick={() => setIsChatVisible(true)}
                  title="Open Main Chat"
                >
                  <MessageSquare aria-hidden="true" className="size-4" />
                </Button>
              )}
        </div>

        <div
          className="grid absolute left-1/2 top-1/2 min-w-0 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: `${viewerGeometry.width}px`,
            height: `${viewerGeometry.height}px`,
            gridTemplateColumns: layout.columns,
            gridTemplateRows: layout.rows,
            gridTemplateAreas: layout.areas,
          }}
        >
          {activeChannelIds.map((channelId) => {
            const slotKey = getMultiviewSlotKeyByChannelId(slots, channelId);
            if (!slotKey) {
              return null;
            }

            const slotLabel = getMultiviewSlotLabelByKey(slotKey);
            const isMain = slotKey === "main";

            return (
              <article
                key={channelId}
                className={cn(
                  "group relative aspect-video min-h-0 min-w-0 overflow-hidden rounded-sm border bg-muted/60 [container-type:size]",
                  isMain && "border-primary/70 bg-card",
                )}
                style={{ gridArea: getMultiviewSlotGridArea(slotKey) }}
                data-viewer-slot={slotKey}
              >
                {isMain && <Crown aria-label="현재 메인" role="img" className="pointer-events-none absolute right-12 top-3 z-10 size-7 text-primary" />}
                <ChzzkViewer channelId={channelId} slotLabel={slotLabel} profile={isMain ? "main" : "sub"} />
                {!isMain && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    aria-label="메인으로 지정"
                    title="메인으로 지정"
                    className="absolute right-12 top-3 z-10 size-8 border border-primary/70 bg-background/75 p-0 text-primary opacity-0 transition-opacity hover:bg-background/95 group-hover:opacity-100 group-focus-within:opacity-100"
                    onClick={() => setSlots((currentSlots) => swapMainWithSub(currentSlots, slotKey))}
                  >
                    <Crown aria-hidden="true" className="size-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label={`${slotLabel} 제거`}
                  title={`${slotLabel} 제거`}
                  className="absolute right-3 top-3 z-10 size-8 border border-primary/70 bg-background/75 p-0 text-primary opacity-0 transition-opacity hover:bg-background/95 group-hover:opacity-100 group-focus-within:opacity-100"
                  onClick={() => removeChannel(channelId)}
                >
                  <X aria-hidden="true" className="size-4" />
                </Button>
              </article>
            );
          })}
        </div>
        {showViewerTip && (
          <div role="status" className="pointer-events-none fixed left-1/2 top-4 z-50 max-w-sm -translate-x-1/2 rounded-md border border-primary bg-primary px-3 py-2 text-sm text-primary-foreground shadow-lg">
            채팅을 접고 T 키를 누르면 더 깔끔하게 시청할 수 있습니다.
          </div>
        )}
      </section>

      {isChatVisible && (
        <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden" aria-label="Main Chat">
          <header className="flex h-10 shrink-0 items-center justify-between border-b bg-card px-2">
            <span className="text-sm font-medium">Main Chat</span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              aria-label="Close Main Chat"
              onClick={() => setIsChatVisible(false)}
              title="Close Main Chat"
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </header>
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
            {mainChannelId && <ChzzkChat channelId={mainChannelId} />}
          </div>
        </aside>
      )}
    </main>
  );
}
