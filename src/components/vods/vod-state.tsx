import { AlertCircle, FolderOpen } from "lucide-react";

export function VodEmptyState() {
  return <section className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center"><FolderOpen aria-hidden="true" className="size-7 text-muted-foreground" /><h2 className="mt-3 font-semibold text-foreground">아직 등록된 다시보기가 없습니다.</h2><p className="mt-1 text-sm text-muted-foreground">수집된 봉누도 다시보기가 여기에 표시됩니다.</p></section>;
}

export function VodErrorState() {
  return <section role="alert" className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center"><AlertCircle aria-hidden="true" className="size-7 text-muted-foreground" /><h2 className="mt-3 font-semibold text-foreground">다시보기를 불러오지 못했습니다.</h2><p className="mt-1 text-sm text-muted-foreground">잠시 후 다시 시도해 주세요.</p></section>;
}
