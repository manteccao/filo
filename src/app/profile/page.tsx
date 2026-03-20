"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/browser";
import { BottomNav } from "@/components/BottomNav";

const AVATAR_COLORS = [
  "bg-violet-600", "bg-blue-600", "bg-emerald-600", "bg-rose-600",
  "bg-amber-600", "bg-cyan-600", "bg-pink-600", "bg-indigo-600",
];

function avatarColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2)
    .map((p) => p[0]?.toUpperCase()).filter(Boolean).join("") || "U";
}

type Rec = {
  id: string;
  professional_name: string;
  category: string;
  city: string;
  note: string | null;
};

const CATEGORY_COLORS: Record<string, string> = {
  dentista: "bg-blue-500/20 text-blue-300",
  medico: "bg-emerald-500/20 text-emerald-300",
  avvocato: "bg-amber-500/20 text-amber-300",
  commercialista: "bg-orange-500/20 text-orange-300",
  idraulico: "bg-cyan-500/20 text-cyan-300",
  elettricista: "bg-yellow-500/20 text-yellow-300",
  altro: "bg-[#8B5CF6]/20 text-[#A78BFA]",
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [recs, setRecs] = useState<Rec[]>([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) { router.push("/login"); return; }

        const [{ data: profile }, { data: myRecs }, { count: following }, { count: followers }] =
          await Promise.all([
            supabase.from("profiles").select("full_name, city, avatar_url, bio").eq("id", user.id).single(),
            supabase.from("recommendations").select("id, professional_name, category, city, note").eq("user_id", user.id).order("created_at", { ascending: false }),
            supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id),
            supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id),
          ]);

        const name = (profile as { full_name?: string | null } | null)?.full_name
          ?? user.user_metadata?.full_name ?? "Utente";
        setFullName(name);
        setCity((profile as { city?: string | null } | null)?.city ?? user.user_metadata?.city ?? "");
        setAvatarUrl((profile as { avatar_url?: string | null } | null)?.avatar_url ?? user.user_metadata?.avatar_url ?? "");
        setBio((profile as { bio?: string | null } | null)?.bio ?? "");
        setRecs((myRecs ?? []) as Rec[]);
        setFollowingCount(following ?? 0);
        setFollowersCount(followers ?? 0);
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const color = avatarColor(fullName);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#0a0a0a]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#222222] bg-[#0a0a0a]">
        <div className="mx-auto flex h-12 max-w-[430px] items-center justify-between px-4">
          <span className="text-base font-bold tracking-tight">{fullName}</span>
          <Link href="/settings" aria-label="Impostazioni">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 text-[#9CA3AF] transition hover:text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[430px] pb-24">

        {/* Profile section */}
        <div className="px-4 pt-5">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-[#8B5CF6]/40 ${color}`}>
              {avatarUrl ? (
                <Image src={avatarUrl} alt={fullName} fill className="object-cover" unoptimized />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                  {initials(fullName)}
                </span>
              )}
            </div>

            {/* Name + city + counters */}
            <div className="flex-1">
              <h1 className="text-lg font-bold leading-tight">{fullName}</h1>
              {city ? <p className="mt-0.5 text-sm text-[#9CA3AF]">{city}</p> : null}

              {/* Counters */}
              <div className="mt-3 flex gap-5">
                <div className="text-center">
                  <p className="text-base font-bold leading-none">{recs.length}</p>
                  <p className="mt-0.5 text-[11px] text-[#9CA3AF]">raccomandazioni</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold leading-none">{followingCount}</p>
                  <p className="mt-0.5 text-[11px] text-[#9CA3AF]">seguiti</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold leading-none">{followersCount}</p>
                  <p className="mt-0.5 text-[11px] text-[#9CA3AF]">follower</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {bio ? (
            <p className="mt-3 text-sm leading-relaxed text-[#D1D5DB]">{bio}</p>
          ) : null}
        </div>

        {/* Divider */}
        <div className="mt-5 border-t border-[#222222]" />

        {/* Recommendations */}
        <div className="px-4 pt-4">
          {recs.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <p className="text-sm text-[#9CA3AF]">Nessuna raccomandazione ancora.</p>
              <p className="mt-1 text-sm text-[#6B7280]">Aggiungi la prima!</p>
              <Link
                href="/add"
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-2xl bg-[#8B5CF6] px-5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(139,92,246,0.3)] transition hover:bg-[#7C3AED]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Aggiungi
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recs.map((r) => (
                <div key={r.id} className="rounded-2xl border border-[#222222] bg-[#111111] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold leading-tight text-white">{r.professional_name}</h2>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CATEGORY_COLORS[r.category] ?? CATEGORY_COLORS.altro}`}>
                      {r.category.charAt(0).toUpperCase() + r.category.slice(1)}
                    </span>
                  </div>
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-[#9CA3AF]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 shrink-0">
                      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.333 0-4.36-3.515-7.498-7.5-7.498S4.5 7.64 4.5 12c0 3.636 1.556 6.33 3.5 8.333a19.583 19.583 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                    </svg>
                    {r.city}
                  </p>
                  {r.note ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#9CA3AF]">{r.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
