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
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#0d0d17] px-6 py-16 text-white">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/filo-logo-3d.png" alt="Filo" className="h-8 w-auto object-contain opacity-90 transition-opacity hover:opacity-100" style={{ mixBlendMode: "screen" }} />
        </Link>
        <div className="mt-8 rounded-3xl border border-[#232340] bg-[#16162a] p-6 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-[#8b8fa8]">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-5 text-sm text-[#8b8fa8]">{footer}</div>
        </div>
      </div>
    </div>
  );
}
