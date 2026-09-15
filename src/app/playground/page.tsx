import { Check, Plus, SlidersHorizontal } from "lucide-react";
import { notFound } from "next/navigation";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "@/components/ui/tag";

function PlaygroundSection({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="rounded-xl border bg-card p-6" aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`} className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

export default function PlaygroundPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="mx-auto min-h-dvh max-w-6xl space-y-6 p-6">
      <header>
        <p className="text-xs font-medium text-tertiary">ChCTV</p>
        <h1 className="mt-1 text-2xl font-semibold">UI PLAYGROUND</h1>
        <p className="mt-2 text-sm text-muted-foreground">공통 UI Primitive의 Variant와 상태를 확인합니다.</p>
      </header>

      <PlaygroundSection title="Button">
        <Button><Plus aria-hidden="true" className="size-4" />멀티뷰 시작</Button>
        <Button variant="secondary">초기화</Button>
        <Button variant="outline">추가</Button>
        <Button variant="ghost">자세히</Button>
        <Button size="sm">Small</Button>
        <Button size="sm" className="h-7 px-2 text-xs"><Plus aria-hidden="true" className="size-3" />추가</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button disabled>Disabled</Button>
      </PlaygroundSection>

      <PlaygroundSection title="Chip">
        <Chip>스텔라이브</Chip>
        <Chip selected>경찰</Chip>
        <Chip selected removable>경찰청</Chip>
        <Chip disabled>버튜버</Chip>
      </PlaygroundSection>

      <PlaygroundSection title="Tag">
        <Tag>#봉누도</Tag>
        <Tag>#경찰</Tag>
        <Tag>#순찰</Tag>
        <Tag>+2</Tag>
      </PlaygroundSection>

      <PlaygroundSection title="Badge">
        <Badge variant="live">LIVE</Badge>
        <Badge variant="accent"><Check aria-hidden="true" className="size-3" />선택됨</Badge>
        <Badge variant="neutral">메인</Badge>
        <Badge variant="neutral">서브1</Badge>
      </PlaygroundSection>

      <PlaygroundSection title="Avatar">
        <Avatar src="https://picsum.photos/seed/chctv-playground-avatar/96/96" alt="카가야키 노바 채널 이미지" size="sm" />
        <Avatar src="https://picsum.photos/seed/chctv-playground-avatar/96/96" alt="카가야키 노바 채널 이미지" />
        <Avatar alt="김억척" fallback="김억척" />
        <Avatar src="https://invalid.example/chctv-avatar.png" alt="이미지 실패 예시" fallback="실패" />
      </PlaygroundSection>

      <PlaygroundSection title="Skeleton">
        <div className="w-56 space-y-2">
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="aspect-video w-64" />
        <div className="w-64 overflow-hidden rounded-xl border">
          <Skeleton className="aspect-video rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </PlaygroundSection>

      <p className="flex items-center gap-2 text-xs text-tertiary"><SlidersHorizontal aria-hidden="true" className="size-4" />개발용 페이지이며 Product Navigation에는 포함하지 않습니다.</p>
    </main>
  );
}
