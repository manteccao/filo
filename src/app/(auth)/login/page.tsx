"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consented, setConsented] = useState(false);

  async function handleGoogleLogin() {
    if (!consented) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://filo.network/auth/callback",
        skipBrowserRedirect: false,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#0a0a0a] px-6">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/filo-logo-new.png"
          alt="Filo"
          className="h-20 w-auto object-contain"
        />
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">Filo</h1>
          <p className="mt-1 text-sm text-[#6b7280]">Il passaparola digitale</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-[320px]">
        <p className="mb-6 text-center text-[15px] leading-relaxed text-[#9ca3af]">
          Accedi con il tuo account Google per entrare nella tua rete di fiducia
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* GDPR consent */}
        <label className="mb-5 flex cursor-pointer items-start gap-3">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`flex h-5 w-5 items-center justify-center rounded border-2 transition ${
                consented
                  ? "border-[#0D9488] bg-[#0D9488]"
                  : "border-[#374151] bg-transparent"
              }`}
            >
              {consented && (
                <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="white"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
          <span className="text-[13px] leading-relaxed text-[#9ca3af]">
            Ho letto e accetto la{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0D9488] underline hover:text-[#0b7c76]"
              onClick={(e) => e.stopPropagation()}
            >
              Privacy Policy
            </a>{" "}
            e i{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0D9488] underline hover:text-[#0b7c76]"
              onClick={(e) => e.stopPropagation()}
            >
              Termini e Condizioni
            </a>
          </span>
        </label>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || !consented}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-white text-sm font-semibold text-[#111] shadow-[0_2px_16px_rgba(255,255,255,0.08)] transition hover:bg-zinc-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#111] border-t-transparent" />
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continua con Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}
