import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-black px-6 py-16 text-zinc-50">
      <main className="w-full max-w-xl rounded-2xl border border-white/10 bg-zinc-950/60 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Filo</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Un social network di raccomandazioni: trova professionisti di
              fiducia, consigliati da persone reali.
            </p>
          </div>
          <div className="h-10 w-10 rounded-2xl border border-white/10 bg-zinc-900" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/50 px-4 text-sm font-medium text-zinc-100 transition hover:bg-zinc-900"
          >
            Registrati
          </Link>
        </div>

        <div className="mt-6 text-xs text-zinc-500">
          La home è pubblica. Il feed è protetto.
        </div>
      </main>
    </div>
  );
}
