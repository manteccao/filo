import Link from "next/link";

import { AuthShell } from "../_components/AuthShell";
import { signUp } from "../actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell
      title="Crea il tuo account"
      subtitle="Un profilo, un filo di fiducia: condividi e scopri professionisti consigliati."
      footer={
        <div className="flex items-center justify-between gap-4">
          <span>
            Hai già un account?{" "}
            <Link href="/login" className="text-zinc-200 hover:underline">
              Accedi
            </Link>
          </span>
          <span className="text-xs text-zinc-500">Auth via Supabase</span>
        </div>
      }
    >
      <form action={signUp} className="space-y-4">
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
            className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none transition focus:border-white/20 focus:bg-zinc-900"
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
            autoComplete="new-password"
            required
            className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none transition focus:border-white/20 focus:bg-zinc-900"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300" htmlFor="fullName">
              Nome
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              placeholder="Mario Rossi"
              className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none transition focus:border-white/20 focus:bg-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300" htmlFor="city">
              Città
            </label>
            <input
              id="city"
              name="city"
              type="text"
              autoComplete="address-level2"
              required
              placeholder="Milano"
              className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none transition focus:border-white/20 focus:bg-zinc-900"
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          Registrati
        </button>
      </form>
    </AuthShell>
  );
}

