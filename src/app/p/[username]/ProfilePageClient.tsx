"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { ProfileActions } from "./ProfileActions";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).filter(Boolean).join("") || "U";
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

type Profile = {
  id: string;
  full_name: string | null;
  city: string | null;
  username: string | null;
  account_type: string | null;
  profession: string | null;
};

type Recommendation = {
  id: string;
  professional_name: string;
  category: string;
  city: string;
  note: string | null;
  created_at: string;
};

type ReceivedRecommendation = {
  id: string;
  note: string | null;
  category: string | null;
  created_at: string;
  author: {
    full_name: string | null;
    username: string | null;
  } | null;
};

export default function ProfilePageClient() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [receivedRecs, setReceivedRecs] = useState<ReceivedRecommendation[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [initialIsBlocked, setInitialIsBlocked] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const [{ data: { user } }, usernameResult] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("profiles")
          .select("id,full_name,city,username,account_type,profession")
          .eq("username", username)
          .maybeSingle(),
      ]);

      let profData = usernameResult.data;
      if (!profData) {
        // fallback: try lookup by id (for profiles without username)
        const { data: byId } = await supabase
          .from("profiles")
          .select("id,full_name,city,username,account_type,profession")
          .eq("id", username)
          .maybeSingle();
        profData = byId ?? null;
      }

      const prof = profData;

      console.log("[profile] profile id:", prof?.id, "account_type:", prof?.account_type);

      setCurrentUserId(user?.id ?? null);
      setProfile(prof ?? null);

      if (!prof) return;

      const isPro = (prof as Profile).account_type === "professional";

      const [{ data: recs }, blockResult, { data: receivedRaw, error: receivedError }] = await Promise.all([
        supabase
          .from("recommendations")
          .select("id,professional_name,category,city,note,created_at")
          .eq("user_id", prof.id)
          .order("created_at", { ascending: false }),
        user && user.id !== prof.id
          ? supabase
              .from("blocks")
              .select("id")
              .eq("user_id", user.id)
              .eq("blocked_user_id", prof.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        isPro
          ? supabase
              .from("recommendations")
              .select("id,note,category,created_at,user_id")
              .eq("professional_id", prof.id)
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [], error: null }),
      ]);

      console.log("[profile] isPro:", isPro, "receivedRaw:", receivedRaw, "error:", receivedError);

      setRecommendations(recs ?? []);
      setInitialIsBlocked(!!(blockResult as { data: unknown }).data);

      if (isPro && receivedRaw && receivedRaw.length > 0) {
        // Fetch authors separately to avoid FK hint issues
        const authorIds = [...new Set((receivedRaw as Array<{ user_id: string }>).map((r) => r.user_id))];
        const { data: authorProfiles } = await supabase
          .from("profiles")
          .select("id,full_name,username")
          .in("id", authorIds);

        const authorMap = new Map(
          (authorProfiles ?? []).map((p) => [p.id as string, p])
        );

        const mapped = (receivedRaw as Array<{
          id: string;
          note: string | null;
          category: string | null;
          created_at: string;
          user_id: string;
        }>).map((r) => {
          const author = authorMap.get(r.user_id) ?? null;
          return {
            id: r.id,
            note: r.note,
            category: r.category,
            created_at: r.created_at,
            author: author ? { full_name: author.full_name as string | null, username: author.username as string | null } : null,
          };
        });
        setReceivedRecs(mapped);
      }
    }

    load();
  }, [username]);

  if (profile === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-zinc-400">Profilo non trovato.</p>
      </div>
    );
  }

  const fullName = profile.full_name ?? "Utente";
  const isOwnProfile = currentUserId === profile.id;
  const isPro = profile.account_type === "professional";

  return (
    <div className="flex min-h-screen flex-col bg-black text-zinc-50">
      {/* Invitation banner */}
      <div className="border-b border-white/10 bg-zinc-950">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <p className="text-sm text-zinc-300">
            <span className="font-medium text-white">
              Unisciti a {fullName} su Filo
            </span>{" "}
            — il social network della fiducia
          </p>
          <a
            href="/login"
            className="inline-flex shrink-0 h-9 items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Iscriviti gratis
          </a>
        </div>
      </div>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        {/* Profile header */}
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 text-lg font-semibold text-zinc-200">
            {initials(fullName)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {fullName}
              </h1>
              {isPro && (
                <span className="rounded-full bg-teal-500/15 px-2.5 py-0.5 text-xs font-semibold text-teal-400">
                  Professionista
                </span>
              )}
              {isPro && receivedRecs.length > 0 && (
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
                  {receivedRecs.length}{" "}
                  {receivedRecs.length === 1 ? "raccomandazione" : "raccomandazioni"}
                </span>
              )}
            </div>
            {isPro && profile.profession ? (
              <p className="mt-0.5 text-sm text-zinc-300">
                {profile.profession}
                {profile.city ? ` · ${profile.city}` : ""}
              </p>
            ) : profile.city ? (
              <p className="mt-0.5 text-sm text-zinc-400">{profile.city}</p>
            ) : null}
            {!isPro && (
              <p className="mt-1 text-xs text-zinc-500">
                {recommendations.length}{" "}
                {recommendations.length === 1
                  ? "raccomandazione"
                  : "raccomandazioni"}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            {isPro && !isOwnProfile && currentUserId && (
              <Link
                href={`/add?professionalId=${profile.id}&name=${encodeURIComponent(fullName)}`}
                className="inline-flex h-9 items-center justify-center rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-500"
              >
                Raccomanda
              </Link>
            )}
            {currentUserId && !isOwnProfile && (
              <ProfileActions
                profileId={profile.id}
                profileName={fullName}
                initialIsBlocked={initialIsBlocked}
              />
            )}
          </div>
        </div>

        {/* Received recommendations — professionals only */}
        {isPro && (
          <section className="mt-10">
            <h2 className="mb-4 text-base font-semibold text-zinc-200">
              Raccomandazioni ricevute
            </h2>
            {receivedRecs.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 text-sm text-zinc-400">
                Nessuna raccomandazione ancora. Sii il primo a raccomandare questo professionista.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {receivedRecs.map((r) => (
                  <article
                    key={r.id}
                    className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
                          {initials(r.author?.full_name ?? "?")}
                        </div>
                        <div>
                          {r.author?.username ? (
                            <Link
                              href={`/p/${r.author.username}`}
                              className="text-sm font-medium text-zinc-200 hover:text-white"
                            >
                              {r.author.full_name ?? r.author.username}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium text-zinc-200">
                              {r.author?.full_name ?? "Utente"}
                            </span>
                          )}
                          {r.category && (
                            <p className="text-xs text-zinc-500">{r.category}</p>
                          )}
                        </div>
                      </div>
                      <time
                        className="shrink-0 text-xs text-zinc-500"
                        dateTime={r.created_at}
                      >
                        {formatDate(r.created_at)}
                      </time>
                    </div>
                    {r.note ? (
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-200">
                        {r.note}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Outgoing recommendations list */}
        <section className="mt-10">
          {isPro && (
            <h2 className="mb-4 text-base font-semibold text-zinc-200">
              Raccomandazioni date
            </h2>
          )}
          <div className="flex flex-col gap-4">
            {recommendations.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 text-sm text-zinc-400">
                Nessuna raccomandazione ancora.
              </div>
            ) : (
              recommendations.map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-semibold tracking-tight">
                        {r.professional_name}
                      </h2>
                      <p className="mt-1 text-sm text-zinc-400">
                        {r.category} · {r.city}
                      </p>
                    </div>
                    <time
                      className="shrink-0 text-xs text-zinc-500"
                      dateTime={r.created_at}
                    >
                      {formatDate(r.created_at)}
                    </time>
                  </div>
                  {r.note ? (
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-200">
                      {r.note}
                    </p>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
