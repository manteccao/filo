import { BottomNav } from "@/components/BottomNav";

function SkeletonRequestCard() {
  return (
    <div className="animate-pulse rounded-[20px] border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-24 rounded-full bg-muted" />
            <div className="h-3 w-10 rounded-full bg-muted" />
          </div>
          <div className="h-3 w-full rounded-full bg-muted" />
          <div className="h-3 w-4/5 rounded-full bg-muted" />
          <div className="flex gap-2 pt-0.5">
            <div className="h-5 w-16 rounded-full bg-muted" />
            <div className="h-5 w-14 rounded-full bg-muted" />
            <div className="ml-auto h-5 w-20 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RequestsLoading() {
  return (
    <div className="min-h-dvh bg-background text-white">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[430px] items-center justify-between px-4">
          <span className="text-base font-bold text-white">Richieste</span>
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-24 pt-4">
        {/* New request button skeleton */}
        <div className="mb-5 h-12 animate-pulse rounded-2xl bg-primary/30" />

        {/* Request cards */}
        <div className="flex flex-col gap-3">
          {[1, 0.85, 0.7, 0.55].map((opacity, i) => (
            <div key={i} style={{ opacity }}>
              <SkeletonRequestCard />
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
