"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
};

type Recommendation = {
  id: string;
  professional_name: string;
  category: string;
  city: string;
  note: string | null;
  created_at: string;
};

export default function ProfilePageClient() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [initialIsBlocked, setInitialIsBlocked] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const [{ data: { user } }, { data: prof }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("profiles")
          .select("id,full_name,city,username,account_type")
          .eq("username", username)
          .single(),
      ]);

      setCurrentUserId(user?.id ?? null);
      setProfile(prof ?? null);

      if (!prof) return;

      const [{ data: recs }, blockResult] = await Promise.all([
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
      ]);

      setRecommendations(recs ?? []);
      setInitialIsBlocked(!!(blockResult as { data: unknown }).data);
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
              {profile.account_type === "professional" && (
                <span className="rounded-full bg-teal-500/15 px-2.5 py-0.5 text-xs font-semibold text-teal-400">
                  Professionista
                </span>
              )}
            </div>
            {profile.city ? (
              <p className="mt-0.5 text-sm text-zinc-400">{profile.city}</p>
            ) : null}
            <p className="mt-1 text-xs text-zinc-500">
              {recommendations.length}{" "}
              {recommendations.length === 1
                ? "raccomandazione"
                : "raccomandazioni"}
            </p>
          </div>

          {currentUserId && !isOwnProfile && (
            <div className="shrink-0">
              <ProfileActions
                profileId={profile.id}
                profileName={fullName}
                initialIsBlocked={initialIsBlocked}
              />
            </div>
          )}
        </div>

        {/* Recommendations list */}
        <div className="mt-8 flex flex-col gap-4">
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
      </main>
    </div>
  );
}
