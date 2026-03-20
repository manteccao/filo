"use client";

import Link from "next/link";
import { useState } from "react";

import { createClient } from "@/lib/supabase/browser";
import { AuthShell } from "../_components/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://filo-kappa.vercel.app/auth/reset-password",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <AuthShell
      title="Recupera password"
      subtitle="Inserisci la tua email e ti mandiamo un link per reimpostare la password."
      footer={
        <Link href="/login" className="text-zinc-200 hover:underline">
          Torna al login
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Link inviato! Controlla la tua email.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@esempio.com"
              className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none transition focus:border-white/20 focus:bg-zinc-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Invio in corso…" : "Invia link di recupero"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
