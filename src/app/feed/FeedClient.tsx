"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { deleteRecommendation, updateRecommendation } from "./actions";

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

const EDIT_CATEGORIES = [
  "dentista", "medico", "avvocato", "commercialista",
  "idraulico", "elettricista", "altro",
] as const;

function RecCard({
  r,
  followingIds,
  secondDegreeIds,
  isOwner,
}: {
  r: FeedRecommendation;
  followingIds: string[];
  secondDegreeIds: string[];
  isOwner: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    professional_name: r.professional_name,
    category: r.category,
    city: r.city,
    note: r.note ?? "",
  });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const profColor = avatarColor(r.professional_name);
  const recColor = avatarColor(r.profile?.full_name ?? "");
  const recommenderName = r.profile?.full_name ?? "Sconosciuto";

  async function handleDelete() {
    setDeleting(true);
    await deleteRecommendation(r.id);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await updateRecommendation(r.id, draft);
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <article className="rounded-2xl border border-[#8B5CF6]/40 bg-[#111111] p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#8B5CF6]">Modifica</p>
        <form onSubmit={handleSave} className="space-y-3">
          <input
            value={draft.professional_name}
            onChange={(e) => setDraft({ ...draft, professional_name: e.target.value })}
            required
            placeholder="Nome professionista"
            className="h-10 w-full rounded-xl border border-[#222222] bg-[#0a0a0a] px-3 text-sm text-white placeholder:text-[#6B7280] outline-none focus:border-[#8B5CF6]"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              className="h-10 rounded-xl border border-[#222222] bg-[#0a0a0a] px-3 text-sm text-white outline-none focus:border-[#8B5CF6]"
            >
              {EDIT_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#111111]">
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
            <input
              value={draft.city}
              onChange={(e) => setDraft({ ...draft, city: e.target.value })}
              required
              placeholder="Città"
              className="h-10 rounded-xl border border-[#222222] bg-[#0a0a0a] px-3 text-sm text-white placeholder:text-[#6B7280] outline-none focus:border-[#8B5CF6]"
            />
          </div>
          <textarea
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value.slice(0, 300) })}
            rows={3}
            placeholder="Nota personale (max 300 caratteri)"
            className="w-full resize-none rounded-xl border border-[#222222] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-[#6B7280] outline-none focus:border-[#8B5CF6]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="h-9 flex-1 rounded-xl border border-[#222222] text-xs text-[#9CA3AF] transition hover:text-white"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-9 flex-1 rounded-xl bg-[#8B5CF6] text-xs font-semibold text-white transition hover:bg-[#7C3AED] disabled:opacity-50"
            >
              {saving ? "Salvataggio…" : "Salva modifiche"}
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-[#222222] bg-[#111111] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white ${profColor}`}>
            {initials(r.professional_name)}
          </div>
          <div className="min-w-0">
            <h2 className="text-[17px] font-bold leading-tight text-white">{r.professional_name}</h2>
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

        <div className="flex shrink-0 items-center gap-2">
          <ConnectionBadge userId={r.user_id} followingIds={followingIds} secondDegreeIds={secondDegreeIds} />
          {isOwner && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#222222] hover:text-white"
                aria-label="Opzioni"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-10 min-w-[130px] overflow-hidden rounded-xl border border-[#222222] bg-[#111111] shadow-xl">
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); setEditing(true); }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-white transition hover:bg-[#222222]"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                    Modifica
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); setConfirming(true); }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-[#222222]"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Elimina
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {r.note ? (
        <p className="mt-3 text-sm leading-relaxed text-[#D1D5DB]">{r.note}</p>
      ) : null}

      {/* Conferma eliminazione */}
      {confirming && (
        <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-xs text-red-300">Sei sicuro di voler eliminare questa raccomandazione?</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="h-7 flex-1 rounded-lg border border-[#222222] text-xs text-[#9CA3AF] transition hover:text-white"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="h-7 flex-1 rounded-lg bg-red-500 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {deleting ? "Eliminazione…" : "Elimina"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 border-t border-[#222222] pt-3">
        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${recColor}`}>
          {initials(recommenderName)}
        </div>
        <span className="text-xs text-[#9CA3AF]">
          Consigliato da <span className="font-medium text-white">{recommenderName}</span>
        </span>
      </div>
    </article>
  );
}

export function FeedClient({
  recommendations,
  followingIds,
  secondDegreeIds,
  currentUserId,
}: {
  recommendations: FeedRecommendation[];
  followingIds: string[];
  secondDegreeIds: string[];
  currentUserId: string;
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
            {filtered.map((r) => (
              <RecCard
                key={r.id}
                r={r}
                followingIds={followingIds}
                secondDegreeIds={secondDegreeIds}
                isOwner={r.user_id === currentUserId}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
