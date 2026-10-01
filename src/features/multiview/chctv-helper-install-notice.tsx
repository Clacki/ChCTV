"use client";

import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { ChctvHelperStatus } from "@/features/multiview/use-chctv-helper-status";

export function ChctvHelperInstallNotice({
  status,
  onRetry,
}: Readonly<{ status: Exclude<ChctvHelperStatus, "ready">; onRetry: () => void }>) {
  const isChecking = status === "checking";

  return (
    <section
      className="absolute inset-0 z-[60] flex items-center justify-center bg-background/90 p-6 text-center backdrop-blur-sm"
      aria-labelledby="chctv-helper-notice-title"
    >
      <div className="w-full max-w-md rounded-md border bg-card p-6 shadow-lg">
        {isChecking ? (
          <>
            <LoaderCircle aria-hidden="true" className="mx-auto size-5 animate-spin text-primary" />
            <h2 id="chctv-helper-notice-title" className="mt-3 text-lg font-semibold">
              ChCTV Helper 연결 확인 중
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">멀티뷰 재생을 준비하고 있습니다.</p>
          </>
        ) : (
          <>
            <h2 id="chctv-helper-notice-title" className="text-lg font-semibold">
              멀티뷰를 사용하려면 ChCTV Helper가 필요합니다
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              치지직 방송을 ChCTV 안에서 재생하려면 ChCTV Helper 확장 프로그램을 설치해주세요.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                disabled
                aria-describedby="chctv-helper-store-pending"
                title="Chrome Web Store 링크 준비 중"
              >
                ChCTV Helper 설치
              </Button>
              <Button type="button" variant="outline" onClick={onRetry}>
                다시 확인
              </Button>
            </div>
            <p id="chctv-helper-store-pending" className="mt-3 text-xs text-muted-foreground">
              Chrome Web Store 링크는 준비 중입니다.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
