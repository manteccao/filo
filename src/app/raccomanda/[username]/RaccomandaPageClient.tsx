"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

const AVATAR_COLORS = [
  "from-teal-600 to-cyan-500",
  "from-blue-600 to-indigo-500",
  "from-violet-600 to-purple-500",
  "from-rose-600 to-pink-500",
  "from-amber-600 to-orange-500",
  "from-emerald-600 to-teal-500",
];

function avatarColor(seed: string) {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return (
    name.trim().split(/\s+/).slice(0, 2)
      .map((p) => p[0]?.toUpperCase()).filter(Boolean).join("") || "?"
  );
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

type Profile = {
  id: string;
  full_name: string | null;
  city: string | null;
  username: string | null;
  account_type: string | null;
  professional_category: string | null;
};

export default function RaccomandaPageClient() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [recCount, setRecCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id,full_name,city,username,account_type,professional_category")
        .eq("username", username)
        .single();

      setProfile(prof ?? null);

      if (!prof) return;

      const fullName = (prof as Profile).full_name ?? "Utente";
      const { count } = await supabase
        .from("recommendations")
        .select("*", { count: "exact", head: true })
        .ilike("professional_name", fullName);

      setRecCount(count ?? 0);
    }

    load();
  }, [username]);

  if (profile === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0a]">
        <p className="text-zinc-400">Profilo non trovato.</p>
      </div>
    );
  }

  const fullName = profile.full_name ?? "Utente";
  const city = profile.city ?? null;
  const category = profile.professional_category ?? null;
  const color = avatarColor(profile.id);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#0a0a0a] px-5 py-12 text-white">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/filo-logo-new.png"
            alt="Filo"
            className="h-8 w-auto object-contain"
           
          />
        </div>

        {/* Professional card */}
        <div className="rounded-[20px] border border-[#1a1a1a] bg-[#111111] p-6 text-center">
          {/* Avatar */}
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${color} text-2xl font-bold text-white ring-4 ring-[#0D9488]/20`}
          >
            {initials(fullName)}
          </div>

          <h1 className="mt-4 text-xl font-bold text-white">{fullName}</h1>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {category && (
              <span className="rounded-full bg-[#0D9488]/15 px-2.5 py-1 text-[12px] font-medium text-[#0D9488]">
                {capitalize(category)}
              </span>
            )}
            {city && (
              <span className="rounded-full bg-[#1a1a1a] px-2.5 py-1 text-[12px] text-[#6b7280]">
                {city}
              </span>
            )}
          </div>

          {typeof recCount === "number" && recCount > 0 && (
            <p className="mt-3 text-[13px] text-[#6b7280]">
              Già{" "}
              <span className="font-semibold text-white">{recCount}</span>{" "}
              {recCount === 1 ? "raccomandazione" : "raccomandazioni"} su Filo
            </p>
          )}
        </div>

        {/* Call to action */}
        <div className="mt-6 text-center">
          <p className="text-[17px] font-bold text-white">
            Hai usato i servizi di {fullName.split(" ")[0]}?
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-[#6b7280]">
            Raccomandalo su Filo — il tuo consiglio aiuterà chi cerca un
            professionista di fiducia nella tua rete.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={`/login?ref=${username}`}
            className="flex h-12 items-center justify-center rounded-full bg-[#0D9488] text-[15px] font-semibold text-white shadow-[0_0_24px_rgba(13,148,136,0.3)] transition hover:bg-[#0b7c76]"
          >
            Iscriviti e raccomanda
          </Link>
          <Link
            href={`/login?redirectTo=/add`}
            className="flex h-12 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#111111] text-[14px] text-[#8b8fa8] transition hover:text-white"
          >
            Ho già un account — accedi
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[12px] text-[#3a3a3a]">
          Filo — il passaparola digitale italiano
        </p>
      </div>
    </div>
  );
}
