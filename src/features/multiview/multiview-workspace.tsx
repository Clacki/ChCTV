"use client";

import { Columns2, LayoutGrid, Rows2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ChzzkChat, ChzzkViewer } from "@/features/multiview/chzzk-viewer";
import {
  getDefaultMultiviewLayoutPreset,
  getMultiviewLayout,
  type MultiviewLayoutPreset,
} from "@/features/multiview/multiview-layout";
import {
  createMultiviewSlots,
  getMultiviewSlotGridArea,
  getMultiviewSlotLabelByKey,
  multiviewSlotKeys,
  swapMainWithSub,
} from "@/features/multiview/multiview-slot";
import { cn } from "@/lib/utils";

const layoutControls: ReadonlyArray<{ preset: MultiviewLayoutPreset; label: string; icon: typeof Columns2 }> = [
  { preset: "focus-right", label: "Focus Right", icon: Columns2 },
  { preset: "focus-bottom", label: "Focus Bottom", icon: Rows2 },
  { preset: "balanced", label: "Balanced", icon: LayoutGrid },
];

export function MultiviewWorkspace({ channelIds }: Readonly<{ channelIds: readonly string[] }>) {
  const [layoutPreset, setLayoutPreset] = useState<MultiviewLayoutPreset>(() => getDefaultMultiviewLayoutPreset(channelIds.length));
  const [slots, setSlots] = useState(() => createMultiviewSlots(channelIds));
  const layout = getMultiviewLayout(channelIds.length, layoutPreset);
  const mainChannelId = slots.main;

  return (
    <main className="grid h-dvh w-screen min-h-0 min-w-0 grid-cols-[minmax(0,1fr)_22rem] gap-2 overflow-hidden p-2">
      <section className="relative min-h-0 min-w-0 overflow-hidden" aria-label="Viewer 영역">
        <div className="absolute right-2 top-2 z-20 flex items-center gap-1 rounded-md border bg-card/90 p-1 backdrop-blur" aria-label="레이아웃 선택">
              {layoutControls.map(({ preset, label, icon: Icon }) => (
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
        </div>

        <div
          className="grid size-full min-h-0 min-w-0 gap-1"
          style={{
            gridTemplateColumns: layout.columns,
            gridTemplateRows: layout.rows,
            gridTemplateAreas: layout.areas,
          }}
        >
          {multiviewSlotKeys.map((slotKey) => {
            const channelId = slots[slotKey];
            if (!channelId) {
              return null;
            }

            const slotLabel = getMultiviewSlotLabelByKey(slotKey);
            const isMain = slotKey === "main";

            return (
              <article
                key={channelId}
                className={cn(
                  "relative min-h-0 min-w-0 overflow-hidden rounded-sm border bg-muted/60",
                  isMain && "border-primary/70 bg-card",
                )}
                style={{ gridArea: getMultiviewSlotGridArea(slotKey) }}
              >
                <span className={cn("pointer-events-none absolute left-3 top-3 z-10 w-fit rounded-sm border px-2 py-1 text-xs font-semibold", isMain ? "border-primary bg-primary text-primary-foreground" : "border-primary bg-background/90 text-primary")}>
                  {slotLabel}
                </span>
                <ChzzkViewer channelId={channelId} slotLabel={slotLabel} profile={isMain ? "main" : "sub"} />
                {!isMain && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-3 right-3 z-10"
                    onClick={() => setSlots((currentSlots) => swapMainWithSub(currentSlots, slotKey))}
                  >
                    메인으로
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <aside className="min-h-0 min-w-0 overflow-hidden rounded-sm border bg-card" aria-label="Main Chat">
        {mainChannelId && <ChzzkChat channelId={mainChannelId} />}
      </aside>
    </main>
  );
}
