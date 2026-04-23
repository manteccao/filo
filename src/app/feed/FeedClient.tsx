"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

import { BottomNav } from "@/components/BottomNav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

import { deleteRecommendation, toggleLike, updateRecommendation } from "./actions";
import { reportContent } from "@/app/moderation/actions";
import { createClient } from "@/lib/supabase/browser";

// Lazy-load heavy drawers — only downloaded when first opened
const NotificationsDrawer = dynamic(
  () => import("@/components/NotificationsDrawer").then((m) => ({ default: m.NotificationsDrawer })),
  { ssr: false }
);
const ReportDialog = dynamic(
  () => import("@/components/ReportDialog").then((m) => ({ default: m.ReportDialog })),
  { ssr: false }
);

// ─── Types ────────────────────────────────────────────────────────────────────


export type FeedRecommendation = {
  type: "recommendation";
  id: string;
  user_id: string;
  professional_name: string;
  category: string;
  city: string;
  note: string | null;
  address: string | null;
  price_range: string | null;
  created_at: string;
  likes_count: number;
  liked_by_me: boolean;
  profile: { full_name: string | null; city: string | null; username: string | null; avatar_url: string | null; account_type: string | null } | null;
  saved_by_me: boolean;
};

export type FeedRequest = {
  type: "request";
  id: string;
  user_id: string;
  content: string;
  category: string;
  city: string;
  created_at: string;
  profile: { full_name: string | null } | null;
};

export type FeedItem = FeedRecommendation | FeedRequest;

type Comment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  full_name: string | null;
  deleted_at: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const EDIT_CATEGORIES = [
  "dentista", "medico di base", "pediatra", "dermatologo", "oculista",
  "fisioterapista", "psicologo", "ginecologo", "ortopedico", "nutrizionista",
  "avvocato", "commercialista", "notaio", "consulente finanziario", "mediatore immobiliare",
  "idraulico", "elettricista", "muratore", "imbianchino", "falegname",
  "giardiniere", "fabbro", "caldaista", "geometra", "architetto",
  "meccanico", "carrozziere", "gommista", "informatico", "web designer",
  "fotografo", "videomaker", "babysitter", "doposcuola", "dog sitter",
  "veterinario", "parrucchiere", "estetista", "personal trainer", "tatuatore",
  "ristorante", "catering", "chef privato", "traslochi", "sartoria",
  "orologiaio", "ottico", "altro",
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

// ─── Utilities ────────────────────────────────────────────────────────────────

function avatarColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2)
    .map((p) => p[0]?.toUpperCase()).filter(Boolean).join("") || "?";
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

function toProSlug(name: string) {
  return encodeURIComponent(name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Connection Badge ─────────────────────────────────────────────────────────

function ConnectionBadge({ userId, followingIds, secondDegreeIds }: {
  userId: string;
  followingIds: string[];
  secondDegreeIds: string[];
}) {
  if (followingIds.includes(userId)) {
    return (
      <span className="rounded-full bg-[#0D9488]/15 px-2 py-[3px] text-[11px] font-medium text-[#0D9488]">
        1° grado
      </span>
    );
  }
  if (secondDegreeIds.includes(userId)) {
    return (
      <span className="rounded-full bg-[#F59E0B]/15 px-2 py-[3px] text-[11px] font-medium text-[#F59E0B]">
        2° grado
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[#1F2937] px-2 py-[3px] text-[11px] font-medium text-[#6b7280]">
      Community
    </span>
  );
}


// ─── Request Replies Sheet ────────────────────────────────────────────────────

type RequestReply = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  full_name: string | null;
  professional_name: string | null;
  rec_category: string | null;
  rec_city: string | null;
};

type MyRec = { id: string; professional_name: string; category: string; city: string };

function RequestRepliesSheet({
  open,
  onOpenChange,
  request,
  currentUserId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  request: FeedRequest;
  currentUserId: string;
}) {
  const [replies, setReplies] = useState<RequestReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [myRecs, setMyRecs] = useState<MyRec[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [selectedRec, setSelectedRec] = useState("");
  const [posting, setPosting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || loaded) return;
    setLoading(true);
    async function load() {
      const supabase = createClient();
      const [{ data: repliesData }, { data: recsData }, { data: meData }] = await Promise.all([
        supabase
          .from("request_replies_with_profile")
          .select("id, user_id, content, created_at, full_name, professional_name, rec_category, rec_city")
          .eq("request_id", request.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("recommendations")
          .select("id, professional_name, category, city")
          .eq("user_id", currentUserId),
        supabase.from("profiles").select("full_name").eq("id", currentUserId).single(),
      ]);
      setReplies((repliesData as RequestReply[]) ?? []);
      setMyRecs((recsData as MyRec[]) ?? []);
      setCurrentUserName((meData as { full_name: string | null } | null)?.full_name ?? null);
      setLoading(false);
      setLoaded(true);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, request.id]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content || posting) return;

    // Optimistic: mostra la risposta immediatamente
    const rec = myRecs.find((r) => r.id === selectedRec) ?? null;
    const tempId = `temp-${Date.now()}`;
    const tempReply: RequestReply = {
      id: tempId,
      user_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      full_name: currentUserName,
      professional_name: rec?.professional_name ?? null,
      rec_category: rec?.category ?? null,
      rec_city: rec?.city ?? null,
    };
    setReplies((prev) => [...prev, tempReply]);
    setText("");
    setSelectedRec("");
    setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);

    setPosting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("request_replies")
      .insert({ request_id: request.id, user_id: currentUserId, content, recommendation_id: selectedRec || null })
      .select("id, user_id, content, created_at")
      .single();
    if (!error && data) {
      // Sostituisce il temp con l'ID reale del server
      setReplies((prev) => prev.map((r) => r.id === tempId
        ? { ...(data as Pick<RequestReply, "id" | "user_id" | "content" | "created_at">), full_name: currentUserName, professional_name: rec?.professional_name ?? null, rec_category: rec?.category ?? null, rec_city: rec?.city ?? null }
        : r));
      // Notifica fire-and-forget
      if (currentUserId !== request.user_id) {
        supabase.from("notifications").insert({
          user_id: request.user_id,
          type: "reply",
          actor_id: currentUserId,
          request_id: request.id,
        });
      }
    } else {
      // Revert optimistic update on error
      setReplies((prev) => prev.filter((r) => r.id !== tempId));
    }
    setPosting(false);
  }

  const authorName = request.profile?.full_name ?? "Utente";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={false} className="rounded-t-3xl bg-[#111111] border-t border-[#1a1a1a] gap-0 p-0 flex flex-col" style={{ maxHeight: "80vh" }}>
        <SheetTitle className="sr-only">Risposte alla richiesta</SheetTitle>
        <div className="flex justify-center pt-3 pb-1 shrink-0"><div className="h-1 w-10 rounded-full bg-[#2a2a2a]" /></div>

        <div className="shrink-0 px-5 py-3 border-b border-[#1a1a1a]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(authorName)}`}>
                <span className="text-xs font-bold text-white">{initials(authorName)}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">{authorName}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-[#9CA3AF]">{request.content}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="rounded-full bg-[#0D9488]/15 px-2.5 py-[3px] text-[10px] text-[#0D9488]">
                    {capitalize(request.category)}
                  </span>
                  <span className="text-[10px] text-[#6b7280]">{request.city}</span>
                </div>
              </div>
            </div>
            <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => onOpenChange(false)} className="shrink-0 rounded-full p-1 text-[#6b7280] transition hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </motion.button>
          </div>
          <p className="mt-2 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">{replies.length} {replies.length === 1 ? "risposta" : "risposte"}</p>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
          {loading ? (
            <div className="flex justify-center py-10"><div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0D9488] border-t-transparent" /></div>
          ) : replies.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#6b7280]">Nessuna risposta ancora. Sii il primo!</p>
          ) : (
            <div className="space-y-5">
              {replies.map((rep) => {
                const name = rep.full_name ?? "Utente";
                return (
                  <div key={rep.id} className="flex gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(name)}`}>
                      <span className="text-xs font-bold text-white">{initials(name)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-white">{name}</span>
                        <span className="text-[10px] text-[#6b7280]">{timeAgo(rep.created_at)}</span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-[#9CA3AF]">{rep.content}</p>
                      {rep.professional_name && (
                        <div className="mt-2 rounded-xl border border-[#0D9488]/20 bg-[#0a0a0a] px-3 py-2">
                          <p className="text-xs font-semibold text-[#0D9488]">{rep.professional_name}</p>
                          <p className="text-[11px] text-[#6b7280]">{rep.rec_category} · {rep.rec_city}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[#1a1a1a] px-4 py-3">
          <form onSubmit={handlePost} className="space-y-2">
            {myRecs.length > 0 && (
              <select value={selectedRec} onChange={(e) => setSelectedRec(e.target.value)} className="h-9 w-full rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-3 text-xs text-white outline-none transition focus:border-[#0D9488]">
                <option value="" className="bg-[#111111]">Allega una tua raccomandazione (opzionale)</option>
                {myRecs.map((r) => <option key={r.id} value={r.id} className="bg-[#111111]">{r.professional_name} · {r.category} · {r.city}</option>)}
              </select>
            )}
            <div className="flex items-end gap-2">
              <textarea autoFocus value={text} onChange={(e) => setText(e.target.value.slice(0, 500))} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePost(e as unknown as React.FormEvent); } }} rows={1} placeholder="Scrivi una risposta..." className="flex-1 resize-none rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder:text-[#6b7280] outline-none transition focus:border-[#0D9488]" />
              <motion.button type="submit" disabled={!text.trim() || posting} whileTap={{ scale: 0.9 }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0D9488] text-white transition disabled:opacity-40">
                {posting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>}
              </motion.button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Comments Sheet ───────────────────────────────────────────────────────────

function CommentsSheet({
  open,
  onOpenChange,
  recommendationId,
  currentUserId,
  recOwnerId,
  onCountChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  recommendationId: string;
  currentUserId: string;
  recOwnerId: string;
  onCountChange: (n: number) => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || loaded) return;
    setLoading(true);
    async function load() {
      const supabase = createClient();
      const [{ data }, { data: meData }] = await Promise.all([
        supabase
          .from("comments_with_profile")
          .select("id, user_id, content, created_at, full_name, deleted_at")
          .eq("recommendation_id", recommendationId)
          .order("created_at", { ascending: true }),
        supabase.from("profiles").select("full_name").eq("id", currentUserId).single(),
      ]);
      const list = (data as Comment[]) ?? [];
      setComments(list);
      onCountChange(list.length);
      setCurrentUserName((meData as { full_name: string | null } | null)?.full_name ?? null);
      setLoading(false);
      setLoaded(true);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, recommendationId]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content || posting) return;
    if (content.length > 1000) return;

    // Optimistic: mostra il commento immediatamente
    const tempId = `temp-${Date.now()}`;
    const tempComment: Comment = {
      id: tempId,
      user_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      full_name: currentUserName,
      deleted_at: null,
    };
    const optimistic = [...comments, tempComment];
    setComments(optimistic);
    onCountChange(optimistic.length);
    setText("");
    setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);

    setPosting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("comments")
      .insert({ recommendation_id: recommendationId, user_id: currentUserId, content })
      .select("id, user_id, content, created_at")
      .single();
    if (!error && data) {
      // Sostituisce il temp con l'ID reale
      setComments((prev) => prev.map((c) => c.id === tempId
        ? { ...(data as Omit<Comment, "full_name" | "deleted_at">), full_name: currentUserName, deleted_at: null }
        : c));
      // Notifica fire-and-forget
      if (currentUserId !== recOwnerId) {
        supabase.from("notifications").insert({
          user_id: recOwnerId,
          type: "comment",
          actor_id: currentUserId,
          recommendation_id: recommendationId,
        });
      }
    } else {
      // Revert on error
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      onCountChange(comments.length);
    }
    setPosting(false);
  }

  async function handleDeleteComment(commentId: string) {
    const supabase = createClient();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("comments")
      .update({ deleted_at: now })
      .eq("id", commentId)
      .eq("user_id", currentUserId);
    if (!error) {
      setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, deleted_at: now } : c));
    }
    setConfirmDeleteId(null);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-3xl bg-[#111111] border-t border-[#1a1a1a] gap-0 p-0 flex flex-col"
        style={{ maxHeight: "75vh" }}
      >
        <SheetTitle className="sr-only">Commenti</SheetTitle>

        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="h-1 w-10 rounded-full bg-[#2a2a2a]" />
        </div>

        <div className="flex shrink-0 items-center justify-between px-5 py-3 border-b border-[#1a1a1a]">
          <h3 className="text-sm font-semibold text-white">Commenti</h3>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1 text-[#6b7280] transition hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0D9488] border-t-transparent" />
            </div>
          ) : comments.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#6b7280]">Nessun commento ancora. Sii il primo!</p>
          ) : (
            <div className="space-y-5">
              {comments.map((c) => {
                const name = c.full_name ?? "Utente";
                const isDeleted = !!c.deleted_at;
                const isOwn = c.user_id === currentUserId;
                return (
                  <div key={c.id} className="flex gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${isDeleted ? "from-zinc-700 to-zinc-600" : avatarColor(name)}`}>
                      <span className="text-[10px] font-bold text-white">{isDeleted ? "·" : initials(name)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      {isDeleted ? (
                        <p className="text-sm italic text-[#4b5563]">Commento eliminato</p>
                      ) : (
                        <>
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs font-semibold text-white">{name}</span>
                              <span className="text-[10px] text-[#6b7280]">{timeAgo(c.created_at)}</span>
                            </div>
                            {isOwn && (
                              confirmDeleteId === c.id ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-[#6b7280]">Eliminare?</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(c.id)}
                                    className="text-[10px] font-semibold text-red-400 hover:text-red-300"
                                  >
                                    Sì
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="text-[10px] text-[#6b7280] hover:text-white"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(c.id)}
                                  className="shrink-0 text-[#3a3a3a] transition hover:text-red-400"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
                                </button>
                              )
                            )}
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-[#9CA3AF]">{c.content}</p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[#1a1a1a] px-4 py-3">
          <form onSubmit={handlePost} className="flex items-end gap-2">
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 500))}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePost(e as unknown as React.FormEvent); } }}
              rows={1}
              placeholder="Scrivi un commento..."
              className="flex-1 resize-none rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder:text-[#6b7280] outline-none transition focus:border-[#0D9488]"
            />
            <motion.button
              type="submit"
              disabled={!text.trim() || posting}
              whileTap={{ scale: 0.9 }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0D9488] text-white transition disabled:opacity-40"
            >
              {posting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
            </motion.button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Feed Request Card ────────────────────────────────────────────────────────

function FeedRequestCard({ r, followingIds, secondDegreeIds, currentUserId, index }: {
  r: FeedRequest;
  followingIds: string[];
  secondDegreeIds: string[];
  currentUserId: string;
  index: number;
}) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const name = r.profile?.full_name ?? "Sconosciuto";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-[20px] bg-[#111111] p-4"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 text-[#0D9488]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-white truncate">{name}</p>
            <p className="text-[12px] text-[#6b7280]">sta cercando…</p>
          </div>
          <ConnectionBadge userId={r.user_id} followingIds={followingIds} secondDegreeIds={secondDegreeIds} />
        </div>

        {/* Content */}
        <p className="mt-3 text-[17px] font-bold leading-snug text-white">{r.content}</p>

        {/* Badges */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#0D9488]/15 px-[10px] py-[4px] text-[11px] text-[#0D9488]">
            {capitalize(r.category)}
          </span>
          <span className="rounded-full bg-[#1F2937] px-[10px] py-[4px] text-[11px] text-[#9CA3AF]">
            {capitalize(r.city)}
          </span>
        </div>

        {/* Divider */}
        <div className="my-3 h-px bg-[#1a1a1a]" />

        {/* Action */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => setRepliesOpen(true)}
          className="flex h-8 items-center gap-1.5 rounded-full bg-[#0D9488]/20 px-4 text-[13px] font-semibold text-[#0D9488] transition hover:bg-[#0D9488]/30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
          </svg>
          Rispondi
        </motion.button>
      </motion.div>

      <RequestRepliesSheet
        open={repliesOpen}
        onOpenChange={setRepliesOpen}
        request={r}
        currentUserId={currentUserId}
      />
    </>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ r, followingIds, secondDegreeIds, isOwner, currentUserId, index }: {
  r: FeedRecommendation;
  followingIds: string[];
  secondDegreeIds: string[];
  isOwner: boolean;
  currentUserId: string;
  index: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [liked, setLiked] = useState(r.liked_by_me ?? false);
  const [likesCount, setLikesCount] = useState(r.likes_count ?? 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saved, setSaved] = useState(r.saved_by_me ?? false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportMenuOpen, setReportMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const [draft, setDraft] = useState({
    professional_name: r.professional_name,
    category: r.category,
    city: r.city,
    note: r.note ?? "",
    address: r.address ?? "",
    price_range: r.price_range ?? "",
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const reportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => {
    if (!reportMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (reportMenuRef.current && !reportMenuRef.current.contains(e.target as Node)) setReportMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [reportMenuOpen]);

  const recommenderName = r.profile?.full_name ?? "Utente";
  const recColor = avatarColor(r.user_id);

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

  async function handleLike() {
    if (likeLoading) return;
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);
    setLikeLoading(true);
    const result = await toggleLike(r.id);
    setLikeLoading(false);
    if ("error" in result) {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    }
  }

  async function handleSaveToggle() {
    if (saveLoading) return;
    const prev = saved;
    setSaved(!prev);
    setSaveLoading(true);
    const supabase = createClient();
    const { error } = prev
      ? await supabase.from("saves").delete().eq("recommendation_id", r.id).eq("user_id", currentUserId)
      : await supabase.from("saves").insert({ recommendation_id: r.id, user_id: currentUserId });
    if (error) setSaved(prev); // revert on error
    setSaveLoading(false);
  }

  async function handleShare() {
    await navigator.clipboard.writeText(`https://filo-kappa.vercel.app/feed`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleReport(reason: string) {
    await reportContent(r.id, "recommendation", reason);
  }

  // Edit form
  if (editing) {
    return (
      <div className="rounded-[20px] bg-[#111111] p-4">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#0D9488]">Modifica raccomandazione</p>
        <form onSubmit={handleSave} className="space-y-3">
          <input value={draft.professional_name} onChange={(e) => setDraft({ ...draft, professional_name: e.target.value })} required placeholder="Nome professionista" className="h-11 w-full rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-4 text-sm text-white placeholder:text-[#6b7280] outline-none focus:border-[#0D9488]" />
          <div className="grid grid-cols-2 gap-3">
            <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="h-11 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-3 text-sm text-white outline-none focus:border-[#0D9488]">
              {EDIT_CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#111111]">{capitalize(c)}</option>)}
            </select>
            <input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} required placeholder="Città" className="h-11 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-3 text-sm text-white placeholder:text-[#6b7280] outline-none focus:border-[#0D9488]" />
          </div>
          <input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} placeholder="Indirizzo o zona (opzionale)" className="h-11 w-full rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-4 text-sm text-white placeholder:text-[#6b7280] outline-none focus:border-[#0D9488]" />
          <select value={draft.price_range} onChange={(e) => setDraft({ ...draft, price_range: e.target.value })} className="h-11 w-full rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-3 text-sm text-white outline-none focus:border-[#0D9488]">
            <option value="" className="bg-[#111111]">Fascia di prezzo (opzionale)</option>
            <option value="€" className="bg-[#111111]">€ — Economico</option>
            <option value="€€" className="bg-[#111111]">€€ — Nella media</option>
            <option value="€€€" className="bg-[#111111]">€€€ — Premium</option>
          </select>
          <textarea value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value.slice(0, 300) })} rows={4} placeholder="Nota personale" className="w-full resize-none rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder:text-[#6b7280] outline-none focus:border-[#0D9488]" />
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setEditing(false)} className="h-11 flex-1 rounded-xl border-[#1a1a1a] bg-transparent text-sm text-white">Annulla</Button>
            <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
              <Button type="submit" disabled={saving} className="h-11 w-full rounded-xl bg-[#0D9488] text-sm font-semibold text-white border-0 hover:bg-[#0b8076] disabled:opacity-50">
                {saving ? "Salvataggio…" : "Salva modifiche"}
              </Button>
            </motion.div>
          </div>
        </form>
      </div>
    );
  }

  const username = r.profile?.username;
  const metaLine = timeAgo(r.created_at);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-[20px] bg-[#111111] p-4"
      >
        {/* Header row */}
        <div className="flex items-center gap-3">
          {username ? (
            <Link href={`/p/${username}`} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br overflow-hidden ${recColor}`}>
              {r.profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.profile.avatar_url} alt={recommenderName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-white">{initials(recommenderName)}</span>
              )}
            </Link>
          ) : (
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br overflow-hidden ${recColor}`}>
              <span className="text-sm font-bold text-white">{initials(recommenderName)}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              {username ? (
                <Link href={`/p/${username}`} className="truncate text-[15px] font-bold text-white transition hover:text-[#0D9488]">{recommenderName}</Link>
              ) : (
                <p className="truncate text-[15px] font-bold text-white">{recommenderName}</p>
              )}
              {r.profile?.account_type === "professional" && (
                <span className="shrink-0 rounded-full bg-[#0D9488]/15 px-1.5 py-[2px] text-[10px] font-semibold text-[#0D9488]">
                  Pro
                </span>
              )}
            </div>
            {metaLine && <p className="text-[12px] text-[#6b7280] truncate">{metaLine}</p>}
          </div>
          <div className="flex items-center gap-2">
            <ConnectionBadge userId={r.user_id} followingIds={followingIds} secondDegreeIds={secondDegreeIds} />
            {isOwner ? (
              <div ref={menuRef} className="relative">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#6b7280] transition hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
                    <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                  </svg>
                </motion.button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-8 z-10 min-w-[130px] overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] shadow-2xl"
                    >
                      <button type="button" onClick={() => { setMenuOpen(false); setEditing(true); }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-white hover:bg-[#111111]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 text-[#0D9488]">
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div ref={reportMenuRef} className="relative">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setReportMenuOpen((v) => !v)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#6b7280] transition hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
                    <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                  </svg>
                </motion.button>
                <AnimatePresence>
                  {reportMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-8 z-10 min-w-[160px] overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] shadow-2xl"
                    >
                      <button type="button" onClick={() => { setReportMenuOpen(false); setReportOpen(true); }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-400 hover:bg-[#111111]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" />
                        </svg>
                        Segnala contenuto
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Professional name */}
        <Link href={`/pro/${toProSlug(r.professional_name)}`} className="mt-3 block text-[17px] font-bold text-white transition hover:text-[#0D9488]">
          {r.professional_name}
        </Link>

        {/* Category + city + price badges */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
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
        {r.note && <p className="mt-2 text-[14px] leading-[1.6] text-[#9CA3AF]">{r.note}</p>}

        {/* Delete confirm */}
        {confirming && (
          <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-xs text-red-300">Eliminare questa raccomandazione?</p>
            <div className="mt-2 flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setConfirming(false)} className="flex-1 h-8 rounded-lg border-[#1a1a1a] bg-transparent text-xs text-white">Annulla</Button>
              <Button type="button" size="sm" onClick={handleDelete} disabled={deleting} className="flex-1 h-8 rounded-lg bg-red-500 text-xs font-semibold text-white border-0 hover:bg-red-600 disabled:opacity-50">
                {deleting ? "…" : "Elimina"}
              </Button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="my-3 h-px bg-[#1a1a1a]" />

        {/* Actions */}
        <div className="flex items-center gap-5">
          {/* Like */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={handleLike}
            disabled={likeLoading}
            className="flex items-center gap-1.5 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className={`h-5 w-5 transition-all duration-200 ${liked ? "fill-red-500 text-red-500 scale-110" : "fill-none text-[#6b7280]"}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span className={`text-[13px] font-medium ${liked ? "text-red-500" : "text-[#6b7280]"}`}>{likesCount}</span>
          </motion.button>

          {/* Comment */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => setCommentsOpen(true)}
            className="flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 text-[#6b7280]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
            <span className="text-[13px] font-medium text-[#6b7280]">{commentsCount}</span>
          </motion.button>

          {/* Share */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={handleShare}
            className="flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={`h-5 w-5 transition ${copied ? "text-[#0D9488]" : "text-[#6b7280]"}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
            </svg>
            <span className={`text-[13px] font-medium transition ${copied ? "text-[#0D9488]" : "text-[#6b7280]"}`}>{copied ? "Copiato!" : "Condividi"}</span>
          </motion.button>

          {/* Spacer + bookmark */}
          <div className="flex-1" />
          <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={handleSaveToggle} disabled={saveLoading} className="disabled:opacity-60">
            <svg viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className={`h-5 w-5 transition-colors ${saved ? "text-[#0D9488]" : "text-[#6b7280]"}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </motion.button>
        </div>
      </motion.div>

      <CommentsSheet
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        recommendationId={r.id}
        currentUserId={currentUserId}
        recOwnerId={r.user_id}
        onCountChange={setCommentsCount}
      />
      <ReportDialog
        open={reportOpen}
        title="Segnala contenuto"
        onClose={() => setReportOpen(false)}
        onSubmit={handleReport}
      />
    </>
  );
}

// ─── Feed Client ──────────────────────────────────────────────────────────────

export function FeedClient({
  items,
  followingIds,
  secondDegreeIds,
  currentUserId,
  initialUnreadCount,
}: {
  items: FeedItem[];
  followingIds: string[];
  secondDegreeIds: string[];
  currentUserId: string;
  initialUnreadCount: number;
}) {
  const [mode, setMode] = useState<"tutti" | "seguiti">("tutti");
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  const filtered = useMemo(() => {
    return items.filter((r) =>
      mode === "tutti" ? true : followingIds.includes(r.user_id)
    );
  }, [items, mode, followingIds]);


  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]">
        <div className="mx-auto flex max-w-[430px] items-center justify-between px-4 py-5">
          <div className="w-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/filo-logo-new.png" alt="Filo" className="h-12 w-auto object-contain" />
          <button
            type="button"
            onClick={() => setNotifsOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#6b7280] transition hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Filter pills */}
      <div className="mx-auto max-w-[430px] px-4 pb-3 pt-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("tutti")}
            className={`rounded-full px-4 py-[6px] text-[13px] font-medium transition ${
              mode === "tutti" ? "bg-[#0D9488] text-white" : "bg-[#1a1a1a] text-[#6b7280]"
            }`}
          >
            Tutti
          </button>
          <button
            type="button"
            onClick={() => setMode("seguiti")}
            className={`rounded-full px-4 py-[6px] text-[13px] font-medium transition ${
              mode === "seguiti" ? "bg-[#0D9488] text-white" : "bg-[#1a1a1a] text-[#6b7280]"
            }`}
          >
            Seguiti
          </button>
        </div>
      </div>

      {/* Feed */}
      <main className="mx-auto max-w-[430px] px-4 pb-28">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <p className="text-sm text-[#9CA3AF]">Nessuna raccomandazione ancora.</p>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link href="/add" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#0D9488] px-6 text-sm font-semibold text-white">
                Aggiungi la prima
              </Link>
            </motion.div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-[#9CA3AF]">Nessun contenuto da chi segui.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((item, i) =>
              item.type === "recommendation" ? (
                <PostCard
                  key={item.id}
                  r={item}
                  followingIds={followingIds}
                  secondDegreeIds={secondDegreeIds}
                  isOwner={item.user_id === currentUserId}
                  currentUserId={currentUserId}
                  index={i}
                />
              ) : (
                <FeedRequestCard
                  key={item.id}
                  r={item}
                  followingIds={followingIds}
                  secondDegreeIds={secondDegreeIds}
                  currentUserId={currentUserId}
                  index={i}
                />
              )
            )}
          </div>
        )}
      </main>

      <BottomNav />

      <NotificationsDrawer
        open={notifsOpen}
        onOpenChange={setNotifsOpen}
        onMarkAllRead={() => setUnreadCount(0)}
      />
    </div>
  );
}
