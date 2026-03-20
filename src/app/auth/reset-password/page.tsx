"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri.");
      return;
    }
    if (password !== confirm) {
      setError("Le password non coincidono.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/feed");
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-black px-6 py-16 text-zinc-50">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur">
          <h1 className="text-2xl font-semibold tracking-tight">Nuova password</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Scegli una nuova password per il tuo account Filo.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm text-zinc-300" htmlFor="password">
                Nuova password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 text-sm text-zinc-50 outline-none transition focus:border-white/20 focus:bg-zinc-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300" htmlFor="confirm">
                Conferma password
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 text-sm text-zinc-50 outline-none transition focus:border-white/20 focus:bg-zinc-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:opacity-50"
            >
              {loading ? "Salvataggio…" : "Salva nuova password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
