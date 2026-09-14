import { DiscoveryMultiviewWorkspace } from "@/features/discovery/discovery-multiview-workspace";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 shrink-0 items-center border-b bg-card px-6">
        <p className="text-sm font-medium text-muted-foreground">GLOBAL AREA</p>
      </header>

      <DiscoveryMultiviewWorkspace />
    </div>
  );
}
