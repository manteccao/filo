import { BottomNav } from "@/components/BottomNav";

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[20px] bg-[#111111] p-4">
      {/* Header row: avatar + name/meta + badge */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 shrink-0 rounded-full bg-[#1a1a1a]" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-28 rounded-full bg-[#1a1a1a]" />
          <div className="h-3 w-20 rounded-full bg-[#1a1a1a]" />
        </div>
        <div className="h-5 w-14 rounded-full bg-[#1a1a1a]" />
      </div>

      {/* Professional name + category/city badges */}
      <div className="mt-3 space-y-2">
        <div className="h-4 w-44 rounded-full bg-[#1a1a1a]" />
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-[#1a1a1a]" />
          <div className="h-5 w-12 rounded-full bg-[#1a1a1a]" />
        </div>
      </div>

      {/* Note lines */}
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full rounded-full bg-[#1a1a1a]" />
        <div className="h-3 w-4/5 rounded-full bg-[#1a1a1a]" />
      </div>

      {/* Divider */}
      <div className="my-3 h-px bg-[#1a1a1a]" />

      {/* Actions: like | comment | share | [spacer] | bookmark */}
      <div className="flex items-center gap-5">
        <div className="h-5 w-10 rounded-full bg-[#1a1a1a]" />
        <div className="h-5 w-10 rounded-full bg-[#1a1a1a]" />
        <div className="h-5 w-16 rounded-full bg-[#1a1a1a]" />
        <div className="ml-auto h-5 w-5 rounded bg-[#1a1a1a]" />
      </div>
    </div>
  );
}

export default function FeedLoading() {
  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]">
        <div className="mx-auto flex max-w-[430px] items-center justify-between px-4 py-5">
          <div className="w-10" />
          <div className="h-12 w-16 animate-pulse rounded-xl bg-[#1a1a1a]" />
          <div className="h-10 w-10 animate-pulse rounded-full bg-[#1a1a1a]" />
        </div>
      </header>

      {/* Stories row */}
      <div className="flex gap-4 overflow-hidden px-4 py-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex shrink-0 flex-col items-center gap-1.5 animate-pulse">
            <div className="h-[52px] w-[52px] rounded-full bg-[#1a1a1a]" />
            <div className="h-2.5 w-9 rounded-full bg-[#1a1a1a]" />
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="mx-auto max-w-[430px] px-4 pb-3 pt-4">
        <div className="flex gap-2">
          <div className="h-8 w-14 animate-pulse rounded-full bg-[#1a1a1a]" />
          <div className="h-8 w-20 animate-pulse rounded-full bg-[#1a1a1a]" />
        </div>
      </div>

      {/* Cards */}
      <main className="mx-auto max-w-[430px] px-4 pb-28">
        <div className="flex flex-col gap-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
