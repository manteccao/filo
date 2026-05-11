import { BottomNav } from "@/components/BottomNav";

export default function AddLoading() {
  return (
    <div className="min-h-dvh bg-background text-white">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[430px] items-center justify-center px-4">
          <div className="h-9 w-16 animate-pulse rounded-xl bg-muted" />
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-28 pt-4">
        {/* Title */}
        <div className="h-7 w-52 animate-pulse rounded-full bg-muted" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded-full bg-muted" />

        {/* Form skeleton */}
        <div className="mt-6 space-y-4">
          {/* Professional name */}
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 animate-pulse rounded-full bg-muted" />
            <div className="h-12 animate-pulse rounded-2xl bg-card" />
          </div>

          {/* Category + city row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="h-3.5 w-20 animate-pulse rounded-full bg-muted" />
              <div className="h-12 animate-pulse rounded-2xl bg-card" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3.5 w-12 animate-pulse rounded-full bg-muted" />
              <div className="h-12 animate-pulse rounded-2xl bg-card" />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <div className="h-3.5 w-40 animate-pulse rounded-full bg-muted" />
            <div className="h-12 animate-pulse rounded-2xl bg-card" />
          </div>

          {/* Note textarea */}
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 animate-pulse rounded-full bg-muted" />
            <div className="h-28 animate-pulse rounded-2xl bg-card" />
          </div>

          {/* Submit button */}
          <div className="h-14 animate-pulse rounded-2xl bg-primary/30" />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
