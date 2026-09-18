import { VodCard } from "@/components/vods/vod-card";
import { createVodDisplayItems } from "@/lib/vod-display";
import { readVodSnapshot } from "@/server/vods/vod-snapshot-store";
import type { VodSnapshot } from "@/types/vod-snapshot";

export const dynamic = "force-dynamic";

export default async function VodsPage() {
  let snapshot: VodSnapshot | null = null;
  let hasReadError = false;

  try {
    snapshot = await readVodSnapshot();
  } catch {
    hasReadError = true;
  }

  if (hasReadError) return <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12"><section className="w-full max-w-xl rounded-xl border border-dashed p-8 text-center"><h1 className="text-xl font-semibold">봉누도 다시보기</h1><p className="mt-2 text-sm text-muted-foreground">다시보기 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p></section></main>;

  if (snapshot === null) {
    return <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12"><section className="w-full max-w-xl rounded-xl border border-dashed p-8 text-center"><h1 className="text-xl font-semibold">봉누도 다시보기</h1><p className="mt-2 text-sm text-muted-foreground">봉누도 다시보기를 준비하고 있습니다. 잠시 후 다시 확인해 주세요.</p></section></main>;
  }

  const items = createVodDisplayItems(snapshot.vods);
  return <main className="min-h-dvh bg-background px-4 py-8 sm:px-6 sm:py-10"><section className="mx-auto w-full max-w-screen-2xl"><p className="text-sm font-medium text-primary">ChCTV</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">봉누도 다시보기</h1><p className="mt-2 text-sm text-muted-foreground">봉누도 참가자들의 CHZZK 다시보기입니다.</p>{items.length > 0 ? <ul aria-label="봉누도 다시보기 목록" className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] items-start gap-3">{items.map((item) => <li key={item.vod.videoNo} className="min-w-0"><VodCard {...item} /></li>)}</ul> : <div className="mt-6 rounded-xl border border-dashed p-8 text-center"><p className="text-sm font-medium">봉누도 시작일 이후 다시보기가 없습니다.</p></div>}{snapshot.failures.length > 0 && <p className="mt-4 text-sm text-muted-foreground">일부 채널의 다시보기 정보를 불러오지 못했습니다.</p>}</section></main>;
}
