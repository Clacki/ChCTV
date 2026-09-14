import { StreamCard, StreamCardSkeleton } from "@/components/streams/stream-card";
import { mockStreams } from "@/data/mock-streams";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 shrink-0 items-center border-b bg-card px-6">
        <p className="text-sm font-medium text-muted-foreground">GLOBAL AREA</p>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-4 p-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section
          aria-labelledby="discovery-heading"
          className="min-h-80 min-w-0 rounded-xl border bg-card p-6"
        >
          <h1 id="discovery-heading" className="text-base font-medium">
            DISCOVERY AREA
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            예시 방송 · 선택된 모습과 로딩 상태를 포함합니다.
          </p>
          <ul className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] items-start gap-4">
            {mockStreams.map((stream, index) => (
              <li key={stream.id} className="min-w-0">
                <StreamCard stream={stream} selected={index === 0} />
              </li>
            ))}
            <li className="min-w-0">
              <StreamCardSkeleton />
            </li>
          </ul>
        </section>

        <aside
          aria-labelledby="selection-heading"
          className="flex min-h-80 min-w-0 flex-col rounded-xl border bg-card"
        >
          <h2 id="selection-heading" className="p-6 text-sm font-medium text-muted-foreground">
            SELECTION / CONTEXT AREA
          </h2>
          <div className="mt-auto flex min-h-24 items-center rounded-b-xl border-t bg-muted px-6">
            <p className="text-sm font-medium text-muted-foreground">ACTION AREA</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
