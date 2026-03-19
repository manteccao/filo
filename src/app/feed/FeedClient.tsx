"use client";

import { useMemo, useState } from "react";

const CATEGORIES = [
  "tutte",
  "dentista",
  "medico",
  "avvocato",
  "commercialista",
  "idraulico",
  "elettricista",
  "altro",
] as const;

type CategoryFilter = (typeof CATEGORIES)[number];

export type FeedRecommendation = {
  id: string;
  user_id: string;
  professional_name: string;
  category: string;
  city: string;
  note: string | null;
  created_at: string;
  profile: { full_name: string | null; city: string | null } | null;
};

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function getRecommenderName(r: FeedRecommendation) {
  return r.profile?.full_name ?? "Sconosciuto";
}

function ConnectionBadge({
  userId,
  followingIds,
  secondDegreeIds,
}: {
  userId: string;
  followingIds: string[];
  secondDegreeIds: string[];
}) {
  if (followingIds.includes(userId)) {
    return (
      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400 ring-1 ring-emerald-500/30">
        1° grado
      </span>
    );
  }
  if (secondDegreeIds.includes(userId)) {
    return (
      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400 ring-1 ring-amber-500/30">
        2° grado
      </span>
    );
  }
  return (
    <span className="rounded-full bg-zinc-700/40 px-2 py-0.5 text-[10px] font-medium text-zinc-400 ring-1 ring-white/10">
      Community
    </span>
  );
}

export function FeedClient({
  recommendations,
  followingIds,
  secondDegreeIds,
}: {
  recommendations: FeedRecommendation[];
  followingIds: string[];
  secondDegreeIds: string[];
}) {
  const [city, setCity] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("tutte");
  const [mode, setMode] = useState<"tutti" | "seguiti">("tutti");

  const filtered = useMemo(() => {
    const cityQ = city.trim().toLowerCase();
    const catQ = category;

    return recommendations.filter((r) => {
      const matchCity = cityQ
        ? (r.city ?? "").toLowerCase().includes(cityQ)
        : true;
      const matchCategory =
        catQ === "tutte" ? true : (r.category ?? "") === catQ;
      const matchFollow =
        mode === "tutti" ? true : followingIds.includes(r.user_id);
      return matchCity && matchCategory && matchFollow;
    });
  }, [recommendations, city, category, mode, followingIds]);

  return (
    <div className="flex min-h-[calc(100vh-0px)] flex-1 flex-col bg-black text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6">
          <a href="/feed" className="text-sm font-semibold tracking-tight">
            Filo
          </a>

          <div className="flex items-center gap-3">
            <a
              href="/add"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Aggiungi
            </a>
            <a
              href="/users"
              className="hidden text-xs text-zinc-400 hover:text-zinc-200 sm:inline-flex"
            >
              Persone
            </a>
          </div>

          <a
            href="/profile"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/40 text-sm text-zinc-200 transition hover:bg-zinc-900"
            aria-label="Profilo"
            title="Profilo"
          >
            <span className="h-2 w-2 rounded-full bg-zinc-600" />
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1 rounded-full bg-zinc-900/80 p-1 text-xs text-zinc-300">
              <button
                type="button"
                onClick={() => setMode("tutti")}
                className={`h-7 rounded-full px-3 ${
                  mode === "tutti"
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Tutti
              </button>
              <button
                type="button"
                onClick={() => setMode("seguiti")}
                className={`h-7 rounded-full px-3 ${
                  mode === "seguiti"
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Seguiti
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500">
                Città
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Es. Milano"
                className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none transition focus:border-white/20 focus:bg-zinc-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryFilter)}
                className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 text-sm text-zinc-50 outline-none transition focus:border-white/20 focus:bg-zinc-900"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-zinc-950">
                    {c === "tutte"
                      ? "Tutte le categorie"
                      : c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {recommendations.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 text-sm text-zinc-300">
              Nessuna raccomandazione ancora. Aggiungi la prima!
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 text-sm text-zinc-300">
              Nessuna raccomandazione trovata per questa ricerca
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((r) => (
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
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <ConnectionBadge
                        userId={r.user_id}
                        followingIds={followingIds}
                        secondDegreeIds={secondDegreeIds}
                      />
                      <time
                        className="text-xs text-zinc-500"
                        dateTime={r.created_at}
                        title={r.created_at}
                      >
                        {formatDate(r.created_at)}
                      </time>
                    </div>
                  </div>

                  {r.note ? (
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-200">
                      {r.note}
                    </p>
                  ) : null}

                  <div className="mt-4 flex items-center justify-between gap-4 text-xs text-zinc-500">
                    <span>Consigliato da {getRecommenderName(r)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

