import Link from "next/link";

export function MultiviewEmptyState() {
  return (
    <main className="min-h-dvh p-6">
      <section className="mx-auto max-w-3xl rounded-xl border bg-card p-6">
        <h1 className="text-xl font-semibold">Multiview</h1>
        <p className="mt-6 text-sm text-muted-foreground">선택된 방송이 없습니다.</p>
        <Link href="/" className="mt-3 inline-flex text-primary underline underline-offset-4">
          Discovery로 돌아가기
        </Link>
      </section>
    </main>
  );
}
