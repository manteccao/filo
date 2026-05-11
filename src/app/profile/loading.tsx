import { BottomNav } from "@/components/BottomNav";

function SkeletonRecCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="h-4 w-36 rounded-full bg-muted" />
        <div className="h-5 w-16 rounded-full bg-muted" />
      </div>
      <div className="mt-2 h-3 w-16 rounded-full bg-muted" />
      <div className="mt-2 space-y-1.5">
        <div className="h-3 w-full rounded-full bg-muted" />
        <div className="h-3 w-2/3 rounded-full bg-muted" />
      </div>
    </div>
  );
}

export default function ProfileLoading() {
  return (
    <div className="min-h-dvh bg-background text-white">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[430px] items-center justify-between px-4">
          <div className="h-4 w-28 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-5 animate-pulse rounded bg-muted" />
        </div>
      </header>

      <main className="mx-auto max-w-[430px] pb-28">
        {/* Profile hero */}
        <div className="px-5 pb-6 pt-5">
          <div className="flex animate-pulse items-center gap-5">
            <div className="h-[76px] w-[76px] shrink-0 rounded-full bg-muted" />
            <div className="flex flex-1 justify-around">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="h-5 w-8 rounded-full bg-muted" />
                  <div className="h-3 w-12 rounded-full bg-muted" />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 h-3 w-20 animate-pulse rounded-full bg-muted" />
          <div className="mt-2 animate-pulse space-y-1.5">
            <div className="h-3 w-full rounded-full bg-muted" />
            <div className="h-3 w-3/4 rounded-full bg-muted" />
          </div>
        </div>

        <div className="h-px bg-muted" />

        {/* Recommendations */}
        <div className="px-4 pt-4">
          <div className="flex animate-pulse items-center justify-between pb-3">
            <div className="h-3 w-24 rounded-full bg-muted" />
            <div className="h-7 w-20 rounded-full bg-muted" />
          </div>
          <div className="flex flex-col gap-2.5">
            {[1, 0.8, 0.6].map((opacity, i) => (
              <div key={i} style={{ opacity }}>
                <SkeletonRecCard />
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
