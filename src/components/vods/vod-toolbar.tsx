import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export function VodToolbar() {
  return <div aria-label="다시보기 탐색 도구" className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/40 p-3 sm:flex-row sm:items-center"><label className="relative min-w-0 flex-1"><Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">다시보기 검색</span><input disabled placeholder="제목 또는 참가자 검색" className="h-10 w-full rounded-md border border-border bg-background pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-70" /></label><div className="grid grid-cols-2 gap-2 sm:flex"><Button disabled variant="outline" size="md">참가자</Button><Button disabled variant="outline" size="md">등록일</Button><Button disabled variant="outline" size="md">소속</Button><Button disabled variant="outline" size="md">최신순</Button></div></div>;
}
