import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default async function FeedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?redirectTo=/feed");
  }

  const { data: recs, error: recsError } = await supabase
    .from("recommendations")
    .select("id,user_id,professional_name,category,city,note,created_at")
    .order("created_at", { ascending: false });

  if (recsError) {
    redirect(`/feed?error=${encodeURIComponent(recsError.message)}`);
  }

  const recommendations = recs ?? [];
  const userIds = Array.from(new Set(recommendations.map((r) => r.user_id)));

  const { data: profiles, error: profilesError } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id,full_name,city")
        .in("id", userIds)
    : { data: [], error: null };

  if (profilesError) {
    redirect(`/feed?error=${encodeURIComponent(profilesError.message)}`);
  }

  const profileById = new Map(
    (profiles ?? []).map((p) => [p.id, { full_name: p.full_name, city: p.city }]),
  );

  const merged: RecommendationRow[] = recommendations.map((r) => ({
    ...r,
    profile: profileById.get(r.user_id) ?? null,
  }));

  return <FeedView recommendations={merged} />;
}

type RecommendationRow = {
  id: string;
  user_id: string;
  professional_name: string;
  category: string;
  city: string;
  note: string | null;
  created_at: string;
  profile: { full_name: string | null; city: string | null } | null;
};

function getRecommenderName(r: RecommendationRow) {
  return r.profile?.full_name ?? null;
}

function FeedView({ recommendations }: { recommendations: RecommendationRow[] }) {
  return (
    <div className="flex min-h-[calc(100vh-0px)] flex-1 flex-col bg-black text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6">
          <Link href="/feed" className="text-sm font-semibold tracking-tight">
            Filo
          </Link>

          <Link
            href="/add"
            className="inline-flex h-9 items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Aggiungi
          </Link>

          <Link
            href="/profile"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/40 text-sm text-zinc-200 transition hover:bg-zinc-900"
            aria-label="Profilo"
            title="Profilo"
          >
            <span className="h-2 w-2 rounded-full bg-zinc-600" />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        {recommendations.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 text-sm text-zinc-300">
            Nessuna raccomandazione ancora. Aggiungi la prima!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {recommendations.map((r) => {
              const recommender = getRecommenderName(r) ?? "Sconosciuto";
              return (
                <article
                  key={r.id}
                  className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">
                        {r.professional_name}
                      </h2>
                      <p className="mt-1 text-sm text-zinc-400">
                        {r.category} · {r.city}
                      </p>
                    </div>
                    <time
                      className="shrink-0 text-xs text-zinc-500"
                      dateTime={r.created_at}
                      title={r.created_at}
                    >
                      {formatDate(r.created_at)}
                    </time>
                  </div>

                  {r.note ? (
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-200">
                      {r.note}
                    </p>
                  ) : null}

                  <div className="mt-4 flex items-center justify-between gap-4 text-xs text-zinc-500">
                    <span>Consigliato da {recommender}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

