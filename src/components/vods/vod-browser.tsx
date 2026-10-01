"use client";

import { useEffect, useState } from "react";

import { VodGrid } from "@/components/vods/vod-grid";
import { VodSkeleton } from "@/components/vods/vod-skeleton";
import { VodEmptyState, VodErrorState } from "@/components/vods/vod-state";
import { VodToolbar } from "@/components/vods/vod-toolbar";
import type { VodListResponse } from "@/server/vods/vod-read-model";

type LoadState = { status: "loading" } | { status: "error" } | { status: "success"; data: VodListResponse };

export function VodBrowser() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  useEffect(() => { let active = true; fetch("/api/vods").then(async (response) => { if (!response.ok) throw new Error("VOD read failed"); return response.json() as Promise<VodListResponse>; }).then((data) => { if (active) setState({ status: "success", data }); }).catch(() => { if (active) setState({ status: "error" }); }); return () => { active = false; }; }, []);

  return <main className="min-h-dvh bg-background px-4 py-8 sm:px-6 lg:px-8"><section className="mx-auto w-full max-w-7xl"><div className="mb-6"><p className="text-sm font-medium text-primary">ChCTV</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">봉누도 다시보기</h1><p className="mt-2 text-sm text-muted-foreground">봉누도2 참가자 채널에서 수집된 다시보기입니다.</p></div><VodToolbar /><div className="mt-6">{state.status === "loading" && <div aria-label="다시보기 불러오는 중" className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-4">{Array.from({ length: 8 }, (_, index) => <VodSkeleton key={index} />)}</div>}{state.status === "error" && <VodErrorState />}{state.status === "success" && (state.data.items.length === 0 ? <VodEmptyState /> : <><p className="mb-3 text-sm text-muted-foreground">다시보기 {state.data.total}개</p><VodGrid items={state.data.items} /></>)}</div></section></main>;
}
