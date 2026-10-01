import type { Metadata } from "next";

import { chctvHelperPrivacy } from "@/lib/chctv-helper-privacy";

export const metadata: Metadata = {
  title: "ChCTV Helper 개인정보 안내 | ChCTV",
  description: "ChCTV Helper의 개인정보 및 권한 사용 안내입니다.",
};

export default function ChctvHelperPrivacyPage() {
  return (
    <main className="min-h-dvh bg-background px-4 py-8 sm:px-6 lg:px-8">
      <article className="mx-auto w-full max-w-3xl rounded-md border bg-card p-6 sm:p-8">
        <p className="text-sm font-medium text-primary">ChCTV Helper</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{chctvHelperPrivacy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">최종 수정: {chctvHelperPrivacy.lastUpdated}</p>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">목적</h2>
          <p className="mt-3 leading-7 text-muted-foreground">{chctvHelperPrivacy.purpose}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">수집·저장하지 않는 정보</h2>
          <p className="mt-3 leading-7 text-muted-foreground">ChCTV Helper는 다음 정보를 수집하거나 저장하지 않습니다.</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            {chctvHelperPrivacy.notCollected.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="mt-4 leading-7 text-muted-foreground">{chctvHelperPrivacy.storage}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">동작 중 처리하는 정보</h2>
          <p className="mt-3 leading-7 text-muted-foreground">{chctvHelperPrivacy.processing}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">데이터 전송 및 판매</h2>
          <p className="mt-3 leading-7 text-muted-foreground">{chctvHelperPrivacy.dataTransfer}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">권한 사용 목적</h2>
          <dl className="mt-3 space-y-3 text-muted-foreground">
            {chctvHelperPrivacy.permissions.map(([permission, description]) => (
              <div key={permission}>
                <dt className="font-medium text-foreground">{permission}</dt>
                <dd className="mt-1 leading-7">{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">문의</h2>
          <a className="mt-3 inline-block text-primary underline underline-offset-4" href={chctvHelperPrivacy.supportUrl} target="_blank" rel="noreferrer">
            ChCTV GitHub Issues
          </a>
        </section>

        <p className="mt-8 border-t pt-6 text-sm leading-6 text-muted-foreground">{chctvHelperPrivacy.disclaimer}</p>
      </article>
    </main>
  );
}
