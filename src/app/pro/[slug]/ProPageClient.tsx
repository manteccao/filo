"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { avatarColor, avatarInitials } from "@/lib/avatar";

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

type Rec = {
  id: string;
  user_id: string;
  professional_name: string;
  category: string;
  city: string;
  note: string | null;
  address: string | null;
  price_range: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export default function ProPageClient() {
  const { slug } = useParams<{ slug: string }>();
  const [recommendations, setRecommendations] = useState<Rec[]>([]);
  const [profileById, setProfileById] = useState<Map<string, Profile>>(new Map());
  const [likesPerRec, setLikesPerRec] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const decoded = decodeURIComponent(slug).replace(/-/g, " ");
    const supabase = createClient();

    async function load() {
      const { data: recs } = await supabase
        .from("recommendations")
        .select("id,user_id,professional_name,category,city,note,address,price_range,created_at")
        .ilike("professional_name", decoded)
        .order("created_at", { ascending: false });

      const recList = recs ?? [];
      setRecommendations(recList);

      const userIds = Array.from(new Set(recList.map((r) => r.user_id)));
      const recIds = recList.map((r) => r.id);

      const [profilesResult, likesResult] = await Promise.all([
        userIds.length
          ? supabase.from("profiles").select("id,full_name,username,avatar_url").in("id", userIds)
          : Promise.resolve({ data: [] }),
        recIds.length
          ? supabase.from("recommendation_likes").select("recommendation_id").in("recommendation_id", recIds)
          : Promise.resolve({ data: [] }),
      ]);

      const map = new Map<string, Profile>();
      for (const p of (profilesResult.data ?? []) as Profile[]) map.set(String(p.id), p);
      setProfileById(map);

      const likesMap = new Map<string, number>();
      for (const l of (likesResult.data ?? []) as { recommendation_id: string }[]) {
        likesMap.set(l.recommendation_id, (likesMap.get(l.recommendation_id) ?? 0) + 1);
      }
      setLikesPerRec(likesMap);
      setLoading(false);
    }

    load();
  }, [slug]);

  const decoded = decodeURIComponent(slug).replace(/-/g, " ");
  const displayName = recommendations[0]?.professional_name ?? capitalize(decoded);
  const category = recommendations[0]?.category;

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-12 max-w-[430px] items-center gap-3 px-4">
          <Link href="/feed" className="text-muted-foreground transition hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            {category && (
              <p className="text-[11px] text-muted-foreground">{capitalize(category)}</p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-12 pt-4">
        {/* Summary */}
        <div className="mb-4 rounded-[20px] bg-card p-4">
          <p className="text-2xl font-bold text-white">{displayName}</p>
          {category && (
            <span className="mt-2 inline-block rounded-full bg-primary/15 px-3 py-1 text-[12px] text-primary">
              {capitalize(category)}
            </span>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {recommendations.length === 0
              ? "Nessuna raccomandazione"
              : `${recommendations.length} ${recommendations.length === 1 ? "raccomandazione" : "raccomandazioni"}`}
          </p>
        </div>

        {recommendations.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Nessuna raccomandazione trovata.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recommendations.map((r) => {
              const prof = profileById.get(String(r.user_id));
              const name = prof?.full_name ?? "Utente";
              const username = prof?.username;
              const color = avatarColor(String(r.user_id));
              const likes = likesPerRec.get(r.id) ?? 0;

              return (
                <div key={r.id} className="rounded-[20px] bg-card p-4">
                  {/* Recommender */}
                  <div className="flex items-center gap-3">
                    {username ? (
                      <Link href={`/p/${username}`} className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${color}`}>
                        {prof?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={prof.avatar_url} alt={name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-white">{avatarInitials(name)}</span>
                        )}
                      </Link>
                    ) : (
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${color}`}>
                        <span className="text-xs font-bold text-white">{avatarInitials(name)}</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      {username ? (
                        <Link href={`/p/${username}`} className="block truncate text-sm font-semibold text-white transition hover:text-primary">{name}</Link>
                      ) : (
                        <p className="truncate text-sm font-semibold text-white">{name}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground">{timeAgo(r.created_at)}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/15 px-[10px] py-[4px] text-[11px] text-primary">
                      {capitalize(r.category)}
                    </span>
                    <span className="rounded-full bg-muted px-[10px] py-[4px] text-[11px] text-subdued">
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
                    <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3 w-3 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {r.address}
                    </p>
                  )}

                  {/* Note */}
                  {r.note && (
                    <p className="mt-2 text-[14px] leading-relaxed text-subdued">{r.note}</p>
                  )}

                  {/* Likes */}
                  {likes > 0 && (
                    <p className="mt-3 text-[12px] text-muted-foreground">
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
