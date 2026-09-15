import { DiscoveryMultiviewWorkspace } from "@/features/discovery/discovery-multiview-workspace";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <DiscoveryMultiviewWorkspace />

      <footer className="shrink-0 border-t bg-card/40 px-6 py-4 text-xs leading-5 text-muted-foreground">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-1.5">
          <nav aria-label="ChCTV links">
            <a
              href="https://github.com/Clacki/ChCTV"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground hover:underline hover:underline-offset-4"
            >
              GitHub
            </a>
          </nav>
          <p>ChCTV는 NAVER Corp. 또는 CHZZK가 제공·운영·승인하는 공식 서비스가 아닌 비공식 서드파티 서비스입니다.</p>
          <p>CHZZK 및 관련 상표·서비스에 대한 권리는 NAVER Corp.에 있으며, 방송 및 기타 콘텐츠에 대한 권리는 각 권리자에게 있습니다.</p>
          <p>ChCTV © 2026. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
