import { notFound } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).filter(Boolean).join("") || "U";
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, city")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const name = profile.full_name || "Qualcuno";
  const city = profile.city || "";
  const ini = initials(name);

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-black px-6 text-zinc-50">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[600px] w-[600px] rounded-full bg-white/[0.03] blur-3xl" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        {/* Avatar / initials */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/15 bg-zinc-900 text-2xl font-bold tracking-tight shadow-[0_0_0_6px_rgba(255,255,255,0.04)]">
          {ini}
        </div>

        {/* Who invited you */}
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-zinc-500">
          Invito personale
        </p>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {name}
          {city ? (
            <span className="block text-base font-normal text-zinc-500 mt-1">
              {city}
            </span>
          ) : null}
        </h1>

        <p className="mt-6 max-w-sm text-lg leading-relaxed text-zinc-300">
          ti ha invitato su{" "}
          <span className="font-semibold text-white">Filo</span> — il social
          network dove trovi professionisti di fiducia consigliati da persone
          reali.
        </p>

        {/* CTA */}
        <Link
          href="/register"
          className="mt-10 inline-flex h-14 w-full max-w-xs items-center justify-center rounded-2xl bg-white px-6 text-base font-semibold text-black shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(255,255,255,0.12)] transition hover:bg-zinc-100 active:scale-[0.98]"
        >
          Accetta l&apos;invito — è gratis
        </Link>

        <p className="mt-4 text-xs text-zinc-600">
          Nessuna carta di credito richiesta
        </p>

        {/* Divider */}
        <div className="mt-16 h-px w-full bg-white/5" />

        <p className="mt-6 text-xs text-zinc-600">
          Hai già un account?{" "}
          <Link href="/login" className="text-zinc-400 underline-offset-2 hover:underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}
