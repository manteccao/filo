2import { BottomNav } from "@/components/BottomNav";

function SkeletonCard({ opacity = 1 }: { opacity?: number }) {
  return (
    <div className="animate-pulse rounded-[20px] border border-border bg-card p-5" style={{ opacity }}>
      {/* Header row: avatar + name/meta + badge */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-28 rounded-full bg-muted" />
          <div className="h-3 w-20 rounded-full bg-muted" />
        </div>
        <div className="h-5 w-14 rounded-full bg-muted" />
      </div>

      {/* Professional name */}
      <div className="mt-4 h-5 w-3/5 rounded-full bg-muted" />

      {/* Category/city badges */}
      <div className="mt-2.5 flex gap-2">
        <div className="h-5 w-20 rounded-full bg-muted" />
        <div className="h-5 w-14 rounded-full bg-muted" />
      </div>

      {/* Note lines */}
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded-full bg-muted" />
        <div className="h-3 w-4/5 rounded-full bg-muted" />
        <div className="h-3 w-2/3 rounded-full bg-muted" />
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-muted" />

      {/* Actions */}
      <div className="flex items-center gap-5">
        <div className="h-[22px] w-10 rounded-full bg-muted" />
        <div className="h-[22px] w-10 rounded-full bg-muted" />
        <div className="h-[22px] w-10 rounded-full bg-muted" />
        <div className="ml-auto h-[22px] w-5 rounded-full bg-muted" />
      </div>
    </div>
  );
}

export default function FeedLoading() {
  return (
    <div className="min-h-dvh bg-background text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[430px] items-center justify-between px-4 py-4">
          <div className="w-10" />
          <div className="h-12 w-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        </div>
      </header>

      {/* Tab skeleton */}
      <div className="mx-auto max-w-[430px] px-4 pb-3 pt-4">
        <div className="h-10 animate-pulse rounded-full bg-card" />
      </div>

      {/* Cards */}
      <main className="mx-auto max-w-[430px] px-4 pb-28">
        <div className="flex flex-col gap-3">
          <SkeletonCard opacity={1} />
          <SkeletonCard opacity={0.8} />
          <SkeletonCard opacity={0.6} />
          <SkeletonCard opacity={0.4} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
