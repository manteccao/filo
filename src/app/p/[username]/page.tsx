import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
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

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  // Auth is optional here — public page
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id ?? null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,full_name,city,username")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const isOwnProfile = currentUserId === profile.id;

  // Check if current user has already blocked this profile
  let initialIsBlocked = false;
  if (currentUserId && !isOwnProfile) {
    const { data: block } = await supabase
      .from("blocks")
      .select("id")
      .eq("user_id", currentUserId)
      .eq("blocked_user_id", profile.id)
      .maybeSingle();
    initialIsBlocked = !!block;
  }

  const { data: recs } = await supabase
    .from("recommendations")
    .select("id,professional_name,category,city,note,created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const recommendations = recs ?? [];
  const fullName = profile.full_name ?? "Utente";

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
            href="/register"
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
            <h1 className="text-2xl font-semibold tracking-tight">
              {fullName}
            </h1>
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

          {/* Block / report — only for logged-in users viewing someone else's profile */}
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
