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
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-16 text-white">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/filo-logo-v2.png" alt="Filo" className="h-8 w-auto object-contain opacity-90 transition-opacity hover:opacity-100" />
        </Link>
        <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-5 text-sm text-muted-foreground">{footer}</div>
        </div>
      </div>
    </div>
  );
}
