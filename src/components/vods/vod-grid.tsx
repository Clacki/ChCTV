import { VodCard } from "@/components/vods/vod-card";
import type { VodListItem } from "@/server/vods/vod-read-model";

export function VodGrid({ items }: { items: VodListItem[] }) {
  return <ul aria-label="봉누도 다시보기 목록" className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-4">{items.map((item) => <li key={item.videoNo}><VodCard item={item} /></li>)}</ul>;
}
