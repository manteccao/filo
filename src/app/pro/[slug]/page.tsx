import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "adesso";
  if (mins < 60) return `${mins} min fa`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours === 1 ? "1 ora" : `${hours} ore`} fa`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ieri";
  if (days < 7) return `${days} giorni fa`;
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

const AVATAR_COLORS = [
  "from-teal-600 to-cyan-500",
  "from-blue-600 to-indigo-500",
  "from-violet-600 to-purple-500",
  "from-rose-600 to-pink-500",
  "from-amber-600 to-orange-500",
  "from-emerald-600 to-teal-500",
  "from-cyan-600 to-blue-500",
  "from-fuchsia-600 to-violet-500",
];

function avatarColor(seed: string) {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2)
    .map((p) => p[0]?.toUpperCase()).filter(Boolean).join("") || "?";
}

export default async function ProPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug).replace(/-/g, " ");

  const supabase = await createClient();

  // Fetch all recommendations whose professional_name matches (case-insensitive)
  const { data: recs } = await supabase
    .from("recommendations")
    .select("id,user_id,professional_name,category,city,note,address,price_range,created_at")
    .ilike("professional_name", decoded)
    .order("created_at", { ascending: false });

  const recommendations = recs ?? [];

  // Fetch recommender profiles
  const userIds = Array.from(new Set(recommendations.map((r) => r.user_id)));
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id,full_name,username,avatar_url").in("id", userIds)
    : { data: [] };

  const profileById = new Map(
    (profiles ?? []).map((p) => [String(p.id), p])
  );

  // Likes count per rec
  const recIds = recommendations.map((r) => r.id);
  const { data: allLikes } = recIds.length
    ? await supabase.from("recommendation_likes").select("recommendation_id").in("recommendation_id", recIds)
    : { data: [] };

  const likesPerRec = new Map<string, number>();
  for (const l of allLikes ?? []) {
    likesPerRec.set(l.recommendation_id, (likesPerRec.get(l.recommendation_id) ?? 0) + 1);
  }

  const displayName = recommendations[0]?.professional_name ?? capitalize(decoded);
  const category = recommendations[0]?.category;

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="mx-auto flex h-12 max-w-[430px] items-center gap-3 px-4">
          <Link href="/feed" className="text-[#6b7280] transition hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            {category && (
              <p className="text-[11px] text-[#6b7280]">{capitalize(category)}</p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-12 pt-4">
        {/* Summary */}
        <div className="mb-4 rounded-[20px] bg-[#111111] p-4">
          <p className="text-2xl font-bold text-white">{displayName}</p>
          {category && (
            <span className="mt-2 inline-block rounded-full bg-[#0D9488]/15 px-3 py-1 text-[12px] text-[#0D9488]">
              {capitalize(category)}
            </span>
          )}
          <p className="mt-3 text-sm text-[#6b7280]">
            {recommendations.length === 0
              ? "Nessuna raccomandazione"
              : `${recommendations.length} ${recommendations.length === 1 ? "raccomandazione" : "raccomandazioni"}`}
          </p>
        </div>

        {recommendations.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#6b7280]">Nessuna raccomandazione trovata.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recommendations.map((r) => {
              const prof = profileById.get(String(r.user_id));
              const name = prof?.full_name ?? "Utente";
              const username = prof?.username;
              const color = avatarColor(String(r.user_id));
              const likes = likesPerRec.get(r.id) ?? 0;

              return (
                <div key={r.id} className="rounded-[20px] bg-[#111111] p-4">
                  {/* Recommender */}
                  <div className="flex items-center gap-3">
                    {username ? (
                      <Link href={`/p/${username}`} className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${color}`}>
                        {prof?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={prof.avatar_url} alt={name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-white">{initials(name)}</span>
                        )}
                      </Link>
                    ) : (
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${color}`}>
                        <span className="text-xs font-bold text-white">{initials(name)}</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      {username ? (
                        <Link href={`/p/${username}`} className="block truncate text-sm font-semibold text-white transition hover:text-[#0D9488]">{name}</Link>
                      ) : (
                        <p className="truncate text-sm font-semibold text-white">{name}</p>
                      )}
                      <p className="text-[11px] text-[#6b7280]">{timeAgo(r.created_at)}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#0D9488]/15 px-[10px] py-[4px] text-[11px] text-[#0D9488]">
                      {capitalize(r.category)}
                    </span>
                    <span className="rounded-full bg-[#1F2937] px-[10px] py-[4px] text-[11px] text-[#9CA3AF]">
                      {capitalize(r.city)}
                    </span>
                    {r.price_range && (
                      <span className={`rounded-full px-[10px] py-[4px] text-[11px] ${
                        r.price_range === "€"  ? "bg-emerald-500/15 text-emerald-400" :
                        r.price_range === "€€" ? "bg-amber-500/15 text-amber-400" :
                                                 "bg-rose-500/15 text-rose-400"
                      }`}>
                        {r.price_range}
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  {r.address && (
                    <p className="mt-2 flex items-center gap-1.5 text-[12px] text-[#6b7280]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3 w-3 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {r.address}
                    </p>
                  )}

                  {/* Note */}
                  {r.note && (
                    <p className="mt-2 text-[14px] leading-relaxed text-[#9CA3AF]">{r.note}</p>
                  )}

                  {/* Likes */}
                  {likes > 0 && (
                    <p className="mt-3 text-[12px] text-[#6b7280]">
                      ♥ {likes} {likes === 1 ? "like" : "likes"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
