"use client";

import { BottomNav } from "@/components/BottomNav";

export default function ProfileError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-dvh bg-background text-white">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[430px] items-center justify-between px-4">
          <div className="h-4 w-28 rounded-full bg-muted" />
          <div className="h-5 w-5 rounded bg-muted" />
        </div>
      </header>

      <main className="mx-auto flex max-w-[430px] flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6 text-muted-foreground">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <p className="mt-4 text-[15px] font-semibold text-white">Qualcosa è andato storto</p>
        <p className="mt-1.5 text-sm text-muted-foreground">Non è stato possibile caricare il profilo.</p>
        <button
          onClick={reset}
          className="mt-6 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover active:scale-[0.97]"
        >
          Riprova
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
