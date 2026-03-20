"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { deleteRecommendation, updateRecommendation } from "./actions";

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

const EDIT_CATEGORIES = [
  "dentista", "medico", "avvocato", "commercialista",
  "idraulico", "elettricista", "altro",
] as const;

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

function avatarColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2)
    .map((p) => p[0]?.toUpperCase()).filter(Boolean).join("") || "?";
}

function ConnectionBadge({ userId, followingIds, secondDegreeIds }: {
  userId: string;
  followingIds: string[];
  secondDegreeIds: string[];
}) {
  if (followingIds.includes(userId)) {
    return (
      <span className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-0.5 text-[10px] font-semibold text-white">
        1° grado
      </span>
    );
  }
  if (secondDegreeIds.includes(userId)) {
    return (
      <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-400 px-2.5 py-0.5 text-[10px] font-semibold text-white">
        2° grado
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[#374151] px-2.5 py-0.5 text-[10px] font-semibold text-[#9CA3AF]">
      Community
    </span>
  );
}

function PostCard({ r, followingIds, secondDegreeIds, isOwner }: {
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
  const [liked, setLiked] = useState(false);
  const [likesCount] = useState(() => Math.floor(Math.random() * 40 + 1));
  const [commentsCount] = useState(() => Math.floor(Math.random() * 10));
  const [copied, setCopied] = useState(false);

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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

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

  async function handleShare() {
    await navigator.clipboard.writeText(`https://filo-kappa.vercel.app/feed`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Edit mode
  if (editing) {
    return (
      <article className="rounded-[20px] border border-teal-600/30 bg-[#111111] p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-teal-400">Modifica raccomandazione</p>
        <form onSubmit={handleSave} className="space-y-3">
          <input
            value={draft.professional_name}
            onChange={(e) => setDraft({ ...draft, professional_name: e.target.value })}
            required
            placeholder="Nome professionista"
            className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0a0a0a] px-4 text-sm text-white placeholder:text-[#6B7280] outline-none focus:border-teal-600"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              className="h-11 rounded-xl border border-[#1F2937] bg-[#0a0a0a] px-3 text-sm text-white outline-none focus:border-teal-600"
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
              className="h-11 rounded-xl border border-[#1F2937] bg-[#0a0a0a] px-3 text-sm text-white placeholder:text-[#6B7280] outline-none focus:border-teal-600"
            />
          </div>
          <textarea
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value.slice(0, 300) })}
            rows={4}
            placeholder="Nota personale"
            className="w-full resize-none rounded-xl border border-[#1F2937] bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder:text-[#6B7280] outline-none focus:border-teal-600"
          />
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setEditing(false)} className="h-11 flex-1 rounded-xl border border-[#1F2937] text-sm text-[#9CA3AF] transition hover:text-white">
              Annulla
            </button>
            <button type="submit" disabled={saving} className="h-11 flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 text-sm font-semibold text-white disabled:opacity-50">
              {saving ? "Salvataggio…" : "Salva modifiche"}
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className="rounded-[20px] border border-teal-900/40 bg-[#111111] overflow-hidden">
      {/* TOP — avatar + nome recommender + badge + menu */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${recColor}`}>
          {initials(recommenderName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{recommenderName}</p>
          <p className="text-[11px] text-[#9CA3AF]">ha consigliato</p>
        </div>
        <div className="flex items-center gap-2">
          <ConnectionBadge userId={r.user_id} followingIds={followingIds} secondDegreeIds={secondDegreeIds} />
          {isOwner && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B7280] transition hover:bg-[#1F2937] hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-10 min-w-[130px] overflow-hidden rounded-2xl border border-[#1F2937] bg-[#0a0a0a] shadow-2xl">
                  <button type="button" onClick={() => { setMenuOpen(false); setEditing(true); }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-white hover:bg-[#111111]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 text-teal-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                    Modifica
                  </button>
                  <button type="button" onClick={() => { setMenuOpen(false); setConfirming(true); }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-400 hover:bg-[#111111]">
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

      {/* Divider */}
      <div className="mx-5 h-px bg-[#1F2937]" />

      {/* CENTER — professional info */}
      <div className="px-5 py-4">
        <h2 className="text-2xl font-bold leading-tight text-white">{r.professional_name}</h2>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gradient-to-r from-teal-600 to-cyan-500 px-3 py-1 text-xs font-semibold text-white">
            {r.category.charAt(0).toUpperCase() + r.category.slice(1)}
          </span>
          <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 shrink-0 text-teal-500">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.333 0-4.36-3.515-7.498-7.5-7.498S4.5 7.64 4.5 12c0 3.636 1.556 6.33 3.5 8.333a19.583 19.583 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
            </svg>
            {r.city}
          </span>
        </div>

        {r.note ? (
          <p className="mt-3 text-sm leading-relaxed text-[#9CA3AF]">{r.note}</p>
        ) : null}

        {/* Confirm delete */}
        {confirming && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-xs text-red-300">Eliminare questa raccomandazione?</p>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => setConfirming(false)} className="h-8 flex-1 rounded-lg border border-[#1F2937] text-xs text-[#9CA3AF] hover:text-white">
                Annulla
              </button>
              <button type="button" onClick={handleDelete} disabled={deleting} className="h-8 flex-1 rounded-lg bg-red-500 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50">
                {deleting ? "…" : "Elimina"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM — like, comment, share */}
      <div className="flex items-center gap-1 border-t border-[#1F2937] px-4 py-3">
        {/* Like */}
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 transition hover:bg-[#1F2937]"
        >
          <svg
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.8}
            className={`h-5 w-5 transition-all duration-200 ${liked ? "scale-110 text-red-500" : "text-[#6B7280]"}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <span className={`text-xs font-medium ${liked ? "text-red-500" : "text-[#6B7280]"}`}>
            {liked ? likesCount + 1 : likesCount}
          </span>
        </button>

        {/* Comment */}
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 transition hover:bg-[#1F2937]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 text-[#6B7280]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
          </svg>
          <span className="text-xs font-medium text-[#6B7280]">{commentsCount}</span>
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 transition hover:bg-[#1F2937]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={`h-5 w-5 transition ${copied ? "text-teal-400" : "text-[#6B7280]"}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
          </svg>
          <span className={`text-xs font-medium transition ${copied ? "text-teal-400" : "text-[#6B7280]"}`}>
            {copied ? "Copiato!" : "Condividi"}
          </span>
        </button>
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
  const [mode, setMode] = useState<"tutti" | "seguiti">("tutti");

  const filtered = useMemo(() => {
    return recommendations.filter((r) =>
      mode === "tutti" ? true : followingIds.includes(r.user_id)
    );
  }, [recommendations, mode, followingIds]);

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#1F2937] bg-[#0a0a0a]/95 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-[430px] items-center justify-between px-4">
          <span className="text-base font-bold text-gradient-teal">Filo</span>
          <div className="flex items-center gap-1 rounded-full bg-[#111111] p-1">
            <button
              type="button"
              onClick={() => setMode("tutti")}
              className={`h-7 rounded-full px-4 text-xs font-medium transition ${mode === "tutti" ? "bg-gradient-to-r from-teal-600 to-cyan-500 text-white" : "text-[#9CA3AF]"}`}
            >
              Tutti
            </button>
            <button
              type="button"
              onClick={() => setMode("seguiti")}
              className={`h-7 rounded-full px-4 text-xs font-medium transition ${mode === "seguiti" ? "bg-gradient-to-r from-teal-600 to-cyan-500 text-white" : "text-[#9CA3AF]"}`}
            >
              Seguiti
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-24 pt-4">
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <p className="text-sm text-[#9CA3AF]">Nessuna raccomandazione ancora.</p>
            <Link
              href="/add"
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-500 px-6 text-sm font-semibold text-white shadow-[0_0_24px_rgba(13,148,136,0.35)]"
            >
              Aggiungi la prima
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-[#9CA3AF]">
            Nessuna raccomandazione da chi segui.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((r) => (
              <PostCard
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
