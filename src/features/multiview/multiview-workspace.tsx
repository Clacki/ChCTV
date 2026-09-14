"use client";

import { Columns2, LayoutGrid, Rows2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  getDefaultMultiviewLayoutPreset,
  getMultiviewLayout,
  type MultiviewLayoutPreset,
} from "@/features/multiview/multiview-layout";
import { getMultiviewSlotLabel } from "@/features/multiview/multiview-slot";
import { cn } from "@/lib/utils";

const layoutControls: ReadonlyArray<{ preset: MultiviewLayoutPreset; label: string; icon: typeof Columns2 }> = [
  { preset: "focus-right", label: "Focus Right", icon: Columns2 },
  { preset: "focus-bottom", label: "Focus Bottom", icon: Rows2 },
  { preset: "balanced", label: "Balanced", icon: LayoutGrid },
];

export function MultiviewWorkspace({ channelIds }: Readonly<{ channelIds: readonly string[] }>) {
  const [layoutPreset, setLayoutPreset] = useState<MultiviewLayoutPreset>(() => getDefaultMultiviewLayoutPreset(channelIds.length));
  const layout = getMultiviewLayout(channelIds.length, layoutPreset);

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-6">
        <div>
          <h1 className="text-base font-semibold">Multiview</h1>
          <p className="text-xs text-muted-foreground">{channelIds.length}개 방송 시청 준비</p>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_22rem] gap-4 p-4">
        <section className="flex min-w-0 min-h-0 flex-col rounded-xl border bg-card p-4" aria-label="Viewer 영역">
          <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Viewer Grid</h2>
            <div className="flex items-center gap-1" aria-label="레이아웃 선택">
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
          </div>

          <div
            className="grid min-h-0 flex-1 gap-2"
            style={{
              gridTemplateColumns: layout.columns,
              gridTemplateRows: layout.rows,
              gridTemplateAreas: layout.areas,
            }}
          >
            {channelIds.map((channelId, index) => {
              const slotLabel = getMultiviewSlotLabel(index);
              const isMain = index === 0;

              return (
                <article
                  key={`${channelId}-${index}`}
                  className={cn(
                    "flex min-w-0 min-h-0 flex-col justify-between rounded-md border bg-muted/60 p-4",
                    isMain && "border-primary/70 bg-card",
                  )}
                  style={{ gridArea: isMain ? "main" : `sub${index}` }}
                >
                  <span className={cn("w-fit rounded-sm border px-2 py-1 text-xs font-semibold", isMain ? "border-primary bg-primary text-primary-foreground" : "border-primary text-primary")}>
                    {slotLabel}
                  </span>
                  <p className="break-all font-mono text-sm text-muted-foreground">{channelId}</p>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="flex min-w-0 min-h-0 flex-col rounded-xl border bg-card p-4" aria-label="Chat">
          <h2 className="text-sm font-medium">Chat</h2>
          <div className="mt-3 flex flex-1 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            Chat Placeholder
          </div>
        </aside>
      </main>
    </div>
  );
}
