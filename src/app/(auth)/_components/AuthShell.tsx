import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-0px)] flex-1 items-center justify-center bg-black px-6 py-16 text-zinc-50">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
        >
          <span className="h-2 w-2 rounded-full bg-zinc-700" />
          Filo
        </Link>
        <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950/60 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-6 text-sm text-zinc-400">{footer}</div>
        </div>
      </div>
    </div>
  );
}

