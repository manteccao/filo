"use client";

import { useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";

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

const AVATAR_COLORS = [
  "bg-violet-600",
  "bg-blue-600",
  "bg-emerald-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-cyan-600",
  "bg-pink-600",
  "bg-indigo-600",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).filter(Boolean).join("") || "?";
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
      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>
        1° grado
      </span>
    );
  }
  if (secondDegreeIds.includes(userId)) {
    return (
      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
        2° grado
      </span>
    );
  }
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(107,114,128,0.2)", color: "#6B7280" }}>
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
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const cityQ = city.trim().toLowerCase();
    return recommendations.filter((r) => {
      const matchCity = cityQ ? (r.city ?? "").toLowerCase().includes(cityQ) : true;
      const matchCategory = category === "tutte" ? true : (r.category ?? "") === category;
      const matchFollow = mode === "tutti" ? true : followingIds.includes(r.user_id);
      return matchCity && matchCategory && matchFollow;
    });
  }, [recommendations, city, category, mode, followingIds]);

  return (
    <div className="min-h-svh bg-[#0a0a0a] text-white">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-[#222222] bg-[#0a0a0a]">
        <div className="mx-auto flex h-12 max-w-[430px] items-center justify-center px-4">
          <span className="text-base font-bold tracking-tight text-white">Filo</span>
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-24 pt-4">
        {/* Mode toggle + filter toggle */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1 rounded-full bg-[#111111] p-1">
            <button
              type="button"
              onClick={() => setMode("tutti")}
              className={`h-7 rounded-full px-4 text-xs font-medium transition ${
                mode === "tutti" ? "bg-white text-black" : "text-[#9CA3AF]"
              }`}
            >
              Tutti
            </button>
            <button
              type="button"
              onClick={() => setMode("seguiti")}
              className={`h-7 rounded-full px-4 text-xs font-medium transition ${
                mode === "seguiti" ? "bg-white text-black" : "text-[#9CA3AF]"
              }`}
            >
              Seguiti
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              showFilters || city || category !== "tutte"
                ? "border-[#8B5CF6] text-[#8B5CF6]"
                : "border-[#222222] text-[#9CA3AF]"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Filtri
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mb-4 rounded-2xl border border-[#222222] bg-[#111111] p-4 space-y-3">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Cerca per città…"
              className="h-10 w-full rounded-xl border border-[#222222] bg-[#0a0a0a] px-4 text-sm text-white placeholder:text-[#6B7280] outline-none focus:border-[#8B5CF6]"
            />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    category === c
                      ? "bg-[#8B5CF6] text-white"
                      : "border border-[#222222] text-[#9CA3AF]"
                  }`}
                >
                  {c === "tutte" ? "Tutte" : c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cards */}
        {recommendations.length === 0 ? (
          <div className="rounded-2xl border border-[#222222] bg-[#111111] p-6 text-center text-sm text-[#9CA3AF]">
            Nessuna raccomandazione ancora.<br />Aggiungi la prima!
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#222222] bg-[#111111] p-6 text-center text-sm text-[#9CA3AF]">
            Nessun risultato per questa ricerca.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((r) => {
              const profColor = avatarColor(r.professional_name);
              const recColor = avatarColor(r.profile?.full_name ?? "");
              const recommenderName = r.profile?.full_name ?? "Sconosciuto";

              return (
                <article
                  key={r.id}
                  className="rounded-2xl border border-[#222222] bg-[#111111] p-4"
                >
                  {/* Top row: avatar + info + badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white ${profColor}`}
                      >
                        {initials(r.professional_name)}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-[17px] font-bold leading-tight text-white">
                          {r.professional_name}
                        </h2>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#8B5CF6]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#A78BFA]">
                            {r.category.charAt(0).toUpperCase() + r.category.slice(1)}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 shrink-0">
                              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.333 0-4.36-3.515-7.498-7.5-7.498S4.5 7.64 4.5 12c0 3.636 1.556 6.33 3.5 8.333a19.583 19.583 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                            </svg>
                            {r.city}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ConnectionBadge
                      userId={r.user_id}
                      followingIds={followingIds}
                      secondDegreeIds={secondDegreeIds}
                    />
                  </div>

                  {/* Note */}
                  {r.note ? (
                    <p className="mt-3 text-sm leading-relaxed text-[#D1D5DB]">
                      {r.note}
                    </p>
                  ) : null}

                  {/* Footer */}
                  <div className="mt-3 flex items-center gap-2 border-t border-[#222222] pt-3">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${recColor}`}
                    >
                      {initials(recommenderName)}
                    </div>
                    <span className="text-xs text-[#9CA3AF]">
                      Consigliato da{" "}
                      <span className="font-medium text-white">{recommenderName}</span>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
