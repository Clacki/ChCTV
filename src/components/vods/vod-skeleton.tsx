import { Skeleton } from "@/components/ui/skeleton";

export function VodSkeleton() {
  return <div className="overflow-hidden rounded-xl border border-border/80 bg-muted/70" aria-hidden="true"><Skeleton className="aspect-video w-full rounded-none" /><div className="space-y-3 p-3"><Skeleton className="h-4 w-11/12" /><Skeleton className="h-4 w-7/12" /><Skeleton className="h-3 w-2/3" /></div></div>;
}
