"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

import { createClient } from "@/lib/supabase/browser";
import { cacheGet, cacheSet } from "@/lib/page-cache";

type RequestsCache = {
  userId: string;
  requests: Request[];
  replyCounts: Record<string, number>;
};

const CATEGORIES = [
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

type Request = {
  id: string;
  user_id: string;
  content: string;
  category: string;
  city: string;
  created_at: string;
  full_name: string | null;
};

type Reply = {
  id: string;
  request_id: string;
  user_id: string;
  content: string;
  recommendation_id: string | null;
  created_at: string;
  full_name: string | null;
  professional_name: string | null;
  rec_category: string | null;
  rec_city: string | null;
};

type MyRec = {
  id: string;
  professional_name: string;
  category: string;
  city: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ora";
  if (mins < 60) return `${mins}m fa`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h fa`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}g fa`;
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

// ─── New Request Sheet ────────────────────────────────────────────────────────

function NewRequestSheet({
  open,
  onOpenChange,
  currentUserId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentUserId: string;
  onCreated: (r: Request) => void;
}) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !category || !city.trim()) {
      setError("Compila tutti i campi.");
      return;
    }
    if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      setError("Categoria non valida.");
      return;
    }
    setSaving(true);
    setError("");
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("requests")
      .insert({ user_id: currentUserId, content: content.trim().slice(0, 500), category, city: city.trim() })
      .select("id, user_id, content, category, city, created_at")
      .single();
    if (err || !data) {
      setError(err?.message ?? "Errore durante la pubblicazione.");
      setSaving(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles").select("full_name").eq("id", currentUserId).single();
    onCreated({
      ...(data as Omit<Request, "full_name">),
      full_name: (profile as { full_name: string | null } | null)?.full_name ?? null,
    });
    setContent("");
    setCategory("");
    setCity("");
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-3xl bg-[#16162a] border-t border-[#232340] gap-0 p-0 flex flex-col"
        style={{ maxHeight: "85vh" }}
      >
        <SheetTitle className="sr-only">Nuova richiesta</SheetTitle>

        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="h-1 w-10 rounded-full bg-[#374151]" />
        </div>
        <div className="flex shrink-0 items-center justify-between px-5 py-3 border-b border-[#232340]">
          <h3 className="text-sm font-semibold text-white">Nuova richiesta</h3>
          <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => onOpenChange(false)} className="rounded-full p-1 text-[#6B7280] transition hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">Cosa stai cercando?</label>
              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 200))}
                rows={3}
                placeholder="Es. Cerco un buon commercialista a Milano per la partita IVA…"
                className="w-full resize-none rounded-2xl border border-[#232340] bg-[#0d0d17] px-4 py-3 text-sm text-white placeholder:text-[#6B7280] outline-none transition focus:border-teal-500"
              />
              <p className="text-right text-[11px] text-[#6B7280]">{content.length}/200</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">Categoria</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required className="h-12 w-full rounded-2xl border border-[#232340] bg-[#0d0d17] px-4 text-sm text-white outline-none transition focus:border-teal-500">
                <option value="" className="bg-[#16162a]">Seleziona…</option>
                {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#16162a]">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">Città</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} required placeholder="Es. Milano" className="h-12 w-full rounded-2xl border border-[#232340] bg-[#0d0d17] px-4 text-sm text-white placeholder:text-[#6B7280] outline-none transition focus:border-teal-500" />
            </div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                type="submit"
                disabled={saving || !content.trim() || !category || !city.trim()}
                className="h-12 w-full rounded-2xl bg-[#0D9488] text-sm font-semibold text-white border-0 shadow-[0_0_24px_rgba(13,148,136,0.3)] hover:bg-[#0b7c76] disabled:opacity-50"
              >
                {saving ? "Pubblicazione…" : "Pubblica richiesta"}
              </Button>
            </motion.div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Replies Sheet ────────────────────────────────────────────────────────────

function RepliesSheet({
  open,
  onOpenChange,
  request,
  currentUserId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  request: Request;
  currentUserId: string;
}) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [myRecs, setMyRecs] = useState<MyRec[]>([]);
  const [text, setText] = useState("");
  const [selectedRec, setSelectedRec] = useState("");
  const [posting, setPosting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || loaded) return;
    setLoading(true);
    async function load() {
      const supabase = createClient();
      const [{ data: repliesData }, { data: recsData }] = await Promise.all([
        supabase
          .from("request_replies_with_profile")
          .select("id, request_id, user_id, content, recommendation_id, created_at, full_name, professional_name, rec_category, rec_city")
          .eq("request_id", request.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("recommendations")
          .select("id, professional_name, category, city")
          .eq("user_id", currentUserId),
      ]);
      setReplies((repliesData as Reply[]) ?? []);
      setMyRecs((recsData as MyRec[]) ?? []);
      setLoading(false);
      setLoaded(true);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, request.id]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || posting) return;
    setPosting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("request_replies")
      .insert({ request_id: request.id, user_id: currentUserId, content: text.trim(), recommendation_id: selectedRec || null })
      .select("id, request_id, user_id, content, recommendation_id, created_at")
      .single();
    if (!error && data) {
      const { data: profile } = await supabase
        .from("profiles").select("full_name").eq("id", currentUserId).single();
      const rec = myRecs.find((r) => r.id === selectedRec) ?? null;
      const newReply: Reply = {
        ...(data as Omit<Reply, "full_name" | "professional_name" | "rec_category" | "rec_city">),
        full_name: (profile as { full_name: string | null } | null)?.full_name ?? null,
        professional_name: rec?.professional_name ?? null,
        rec_category: rec?.category ?? null,
        rec_city: rec?.city ?? null,
      };
      setReplies([...replies, newReply]);
      setText("");
      setSelectedRec("");
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);

      // Notifica al proprietario della richiesta
      if (currentUserId !== request.user_id) {
        await supabase.from("notifications").insert({
          user_id: request.user_id,
          type: "reply",
          actor_id: currentUserId,
          request_id: request.id,
        });
      }
    }
    setPosting(false);
  }

  const authorName = request.full_name ?? "Utente";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-3xl bg-[#16162a] border-t border-[#232340] gap-0 p-0 flex flex-col"
        style={{ maxHeight: "80vh" }}
      >
        <SheetTitle className="sr-only">Risposte</SheetTitle>

        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="h-1 w-10 rounded-full bg-[#374151]" />
        </div>

        {/* Original request header */}
        <div className="shrink-0 px-5 py-3 border-b border-[#232340]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <Avatar className={`bg-gradient-to-br ${avatarColor(authorName)} after:hidden`}>
                <AvatarFallback className="bg-transparent text-white text-xs font-bold">{initials(authorName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">{authorName}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-[#D1D5DB]">{request.content}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge className="rounded-full bg-teal-500/20 text-teal-400 border-0 text-[10px] px-2">
                    {request.category.charAt(0).toUpperCase() + request.category.slice(1)}
                  </Badge>
                  <span className="text-[10px] text-[#6B7280]">{request.city}</span>
                </div>
              </div>
            </div>
            <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => onOpenChange(false)} className="shrink-0 rounded-full p-1 text-[#6B7280] transition hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
          <p className="mt-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
            {replies.length} {replies.length === 1 ? "risposta" : "risposte"}
          </p>
        </div>

        {/* Replies */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            </div>
          ) : replies.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#6B7280]">Nessuna risposta ancora. Sii il primo!</p>
          ) : (
            <div className="space-y-5">
              {replies.map((rep) => {
                const name = rep.full_name ?? "Utente";
                return (
                  <div key={rep.id} className="flex gap-3">
                    <Avatar className={`bg-gradient-to-br ${avatarColor(name)} after:hidden`}>
                      <AvatarFallback className="bg-transparent text-white text-xs font-bold">{initials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-white">{name}</span>
                        <span className="text-[10px] text-[#6B7280]">{timeAgo(rep.created_at)}</span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-[#D1D5DB]">{rep.content}</p>
                      {rep.professional_name && (
                        <div className="mt-2 rounded-xl border border-teal-900/40 bg-[#0d0d17] px-3 py-2">
                          <p className="text-xs font-semibold text-teal-400">{rep.professional_name}</p>
                          <p className="text-[11px] text-[#6B7280]">{rep.rec_category} · {rep.rec_city}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reply input */}
        <div className="shrink-0 border-t border-[#232340] px-4 py-3">
          <form onSubmit={handlePost} className="space-y-2">
            {myRecs.length > 0 && (
              <select value={selectedRec} onChange={(e) => setSelectedRec(e.target.value)} className="h-9 w-full rounded-xl border border-[#232340] bg-[#0d0d17] px-3 text-xs text-white outline-none transition focus:border-teal-500">
                <option value="" className="bg-[#16162a]">Allega una tua raccomandazione (opzionale)</option>
                {myRecs.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#16162a]">{r.professional_name} · {r.category} · {r.city}</option>
                ))}
              </select>
            )}
            <div className="flex items-end gap-2">
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 500))}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePost(e as unknown as React.FormEvent); } }}
                rows={1}
                placeholder="Scrivi una risposta..."
                className="flex-1 resize-none rounded-xl border border-[#232340] bg-[#0d0d17] px-4 py-2.5 text-sm text-white placeholder:text-[#6B7280] outline-none transition focus:border-teal-500"
              />
              <motion.button type="submit" disabled={!text.trim() || posting} whileTap={{ scale: 0.9 }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0D9488] text-white transition disabled:opacity-40">
                {posting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Request Card ─────────────────────────────────────────────────────────────

function RequestCard({
  req,
  replyCount,
  isOwner,
  index,
  onOpen,
  onDelete,
}: {
  req: Request;
  replyCount: number;
  isOwner: boolean;
  index: number;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const name = req.full_name ?? "Utente";

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("requests").delete().eq("id", req.id);
    onDelete();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card
        className="rounded-[20px] border border-teal-900/30 bg-[#16162a] gap-0 py-0 shadow-none ring-0 cursor-pointer active:scale-[0.99] transition-transform"
        onClick={onOpen}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className={`bg-gradient-to-br ${avatarColor(name)} after:hidden`}>
              <AvatarFallback className="bg-transparent text-white text-xs font-bold">{initials(name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-white truncate">{name}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-[#6B7280]">{timeAgo(req.created_at)}</span>
                  {isOwner && (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                      className="rounded-full p-1 text-[#6B7280] transition hover:text-red-400"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </motion.button>
                  )}
                </div>
              </div>

              <p className="mt-1.5 text-sm leading-relaxed text-[#E5E7EB]">{req.content}</p>

              <div className="mt-2.5 flex items-center gap-2">
                <Badge className="rounded-full bg-teal-500/20 text-teal-400 border-0 text-[10px] px-2.5">
                  {req.category.charAt(0).toUpperCase() + req.category.slice(1)}
                </Badge>
                <span className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 shrink-0">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.333 0-4.36-3.515-7.498-7.5-7.498S4.5 7.64 4.5 12c0 3.636 1.556 6.33 3.5 8.333a19.583 19.583 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                  </svg>
                  {req.city}
                </span>
                <span className="ml-auto flex items-center gap-1 text-[10px] text-[#6B7280]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                  </svg>
                  {replyCount} {replyCount === 1 ? "risposta" : "risposte"}
                </span>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {confirmDelete && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-xs text-red-300">Eliminare questa richiesta?</p>
                <div className="mt-2 flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setConfirmDelete(false)} className="flex-1 h-8 rounded-lg text-xs">Annulla</Button>
                  <Button type="button" size="sm" onClick={handleDelete} disabled={deleting} className="flex-1 h-8 rounded-lg bg-red-500 text-xs font-semibold text-white border-0 hover:bg-red-600 disabled:opacity-50">
                    {deleting ? "…" : "Elimina"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RequestsPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [replyCounts, setReplyCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [newSheetOpen, setNewSheetOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  useEffect(() => {
    const cached = cacheGet<RequestsCache>("requests");
    if (cached) {
      setCurrentUserId(cached.userId);
      setRequests(cached.requests);
      setReplyCounts(cached.replyCounts);
      setLoading(false);
    }

    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const [{ data: reqs }, { data: counts }] = await Promise.all([
        supabase
          .from("requests_with_profile")
          .select("id, user_id, content, category, city, created_at, full_name")
          .order("created_at", { ascending: false }),
        supabase.from("request_replies").select("request_id"),
      ]);

      const requests = (reqs as Request[]) ?? [];
      const countMap: Record<string, number> = {};
      for (const c of (counts ?? [])) {
        const rid = (c as { request_id: string }).request_id;
        countMap[rid] = (countMap[rid] ?? 0) + 1;
      }

      cacheSet<RequestsCache>("requests", { userId: user.id, requests, replyCounts: countMap });
      setCurrentUserId(user.id);
      setRequests(requests);
      setReplyCounts(countMap);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-dvh bg-[#0d0d17] text-white">
      <header className="sticky top-0 z-40 border-b border-[#232340] bg-[#0d0d17]/95 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-[430px] items-center justify-between px-4">
          <span className="text-base font-bold text-white">Richieste</span>
          <span className="text-xs text-[#6B7280]">Dalla tua rete</span>
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-24 pt-4">
        <motion.div whileTap={{ scale: 0.97 }} className="mb-5">
          <Button
            onClick={() => setNewSheetOpen(true)}
            className="h-12 w-full rounded-2xl bg-[#0D9488] text-sm font-semibold text-white border-0 shadow-[0_0_24px_rgba(13,148,136,0.3)] hover:bg-[#0b7c76]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-5 w-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Fai una richiesta
          </Button>
        </motion.div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-[#232340] bg-[#16162a] p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-[#1a1a1a]" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-3.5 w-24 rounded-full bg-[#1a1a1a]" />
                      <div className="h-3 w-10 rounded-full bg-[#1a1a1a]" />
                    </div>
                    <div className="h-3 w-full rounded-full bg-[#1a1a1a]" />
                    <div className="h-3 w-4/5 rounded-full bg-[#1a1a1a]" />
                    <div className="flex gap-2 pt-0.5">
                      <div className="h-5 w-16 rounded-full bg-[#1a1a1a]" />
                      <div className="h-5 w-14 rounded-full bg-[#1a1a1a]" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <div className="h-7 w-24 rounded-full bg-[#1a1a1a]" />
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#6B7280]">Nessuna richiesta ancora.</p>
            <p className="mt-1 text-xs text-[#4B5563]">Sii il primo a chiedere alla tua rete.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((req, i) => (
              <RequestCard
                key={req.id}
                req={req}
                replyCount={replyCounts[req.id] ?? 0}
                isOwner={req.user_id === currentUserId}
                index={i}
                onOpen={() => setSelectedRequest(req)}
                onDelete={() => setRequests((prev) => prev.filter((r) => r.id !== req.id))}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />

      {currentUserId && (
        <NewRequestSheet
          open={newSheetOpen}
          onOpenChange={setNewSheetOpen}
          currentUserId={currentUserId}
          onCreated={(r) => setRequests((prev) => [r, ...prev])}
        />
      )}

      {selectedRequest && currentUserId && (
        <RepliesSheet
          open={!!selectedRequest}
          onOpenChange={(v) => { if (!v) setSelectedRequest(null); }}
          request={selectedRequest}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
