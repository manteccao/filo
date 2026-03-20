import Link from "next/link";

import { AuthShell } from "../_components/AuthShell";
import { signIn } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell
      title="Bentornato"
      subtitle="Accedi a Filo per continuare a condividere raccomandazioni di fiducia."
      footer={
        <div className="flex items-center justify-between gap-4">
          <span>
            Non hai un account?{" "}
            <Link href="/register" className="text-zinc-200 hover:underline">
              Registrati
            </Link>
          </span>
          <span className="text-xs text-zinc-500">Auth via Supabase</span>
        </div>
      }
    >
      <form action={signIn} className="space-y-4">
        {error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm text-zinc-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@esempio.com"
            className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none ring-0 transition focus:border-white/20 focus:bg-zinc-900"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none ring-0 transition focus:border-white/20 focus:bg-zinc-900"
          />
        </div>

        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          Accedi
        </button>

        <div className="text-center">
          <Link href="/forgot-password" className="text-sm text-zinc-500 hover:text-zinc-300">
            Hai dimenticato la password?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

