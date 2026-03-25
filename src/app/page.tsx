import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#0d0d17] px-6 py-16 text-white">
      <main className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/filo-logo-3d.png" alt="Filo" className="h-9 w-auto object-contain" style={{ mixBlendMode: "screen" }} />
          <p className="mt-4 text-[15px] leading-relaxed text-[#8b8fa8]">
            Il social network della fiducia — trova professionisti
            consigliati da persone reali.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-2xl bg-[#0D9488] text-sm font-semibold text-white shadow-[0_0_24px_rgba(13,148,136,0.4)] transition hover:bg-[#0b7c76] active:scale-[0.98]"
          >
            Accedi
          </Link>
          <Link
            href="/register"
            className="flex h-12 items-center justify-center rounded-2xl border border-[#232340] bg-[#16162a] text-sm font-semibold text-white transition hover:border-teal-500/40 hover:bg-[#1e1e38] active:scale-[0.98]"
          >
            Registrati
          </Link>
        </div>
      </main>
    </div>
  );
}
