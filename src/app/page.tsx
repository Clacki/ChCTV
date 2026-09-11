import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <section className="w-full rounded-xl border bg-card p-8 sm:p-12">
        <Badge variant="secondary">MVP 준비 중</Badge>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">ChCTV</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
          치지직 합방을 더 편하게 보는 방법.
        </p>
        <Button className="mt-8" disabled>곧 공개됩니다</Button>
      </section>
    </main>
  );
}
