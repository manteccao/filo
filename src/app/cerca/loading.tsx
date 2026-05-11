import { BottomNav } from "@/components/BottomNav";

function SkeletonUserCard() {
  return (
    <div className="animate-pulse flex items-center gap-3.5 rounded-2xl border border-border bg-card px-4 py-3.5">
      <div className="h-12 w-12 shrink-0 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-28 rounded-full bg-muted" />
        <div className="h-3 w-20 rounded-full bg-muted" />
      </div>
      <div className="h-8 w-16 shrink-0 rounded-full bg-muted" />
    </div>
  );
}

export default function CercaLoading() {
  return (
    <div className="min-h-dvh bg-background text-white">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[430px] items-center justify-center px-4">
          <div className="h-9 w-16 animate-pulse rounded-xl bg-muted" />
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-28 pt-3">
        {/* Search bar */}
        <div className="h-12 animate-pulse rounded-2xl bg-card" />

        {/* Category pills */}
        <div className="mt-3 flex gap-2 overflow-hidden">
          {[80, 56, 72, 64, 88, 60].map((w, i) => (
            <div
              key={i}
              className="h-8 shrink-0 animate-pulse rounded-full bg-card"
              style={{ width: w }}
            />
          ))}
        </div>

        {/* Section header */}
        <div className="mt-5 mb-3 h-3 w-24 animate-pulse rounded-full bg-muted" />

        {/* User cards */}
        <div className="flex flex-col gap-2.5">
          {[1, 0.85, 0.7, 0.55, 0.4].map((opacity, i) => (
            <div key={i} style={{ opacity }}>
              <SkeletonUserCard />
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
