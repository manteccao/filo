"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/browser";

// ─── Types ────────────────────────────────────────────────────────────────────

type Notif = {
  id: string;
  type: "like" | "comment" | "follow" | "reply";
  actor_id: string;
  recommendation_id: string | null;
  request_id: string | null;
  read: boolean;
  created_at: string;
  actor_name: string | null;
  actor_username: string | null;
  actor_avatar: string | null;
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

function avatarColor(seed: string) {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffff;
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

function notifBody(type: Notif["type"]): string {
  switch (type) {
    case "like":    return "ha messo like alla tua raccomandazione";
    case "comment": return "ha commentato la tua raccomandazione";
    case "follow":  return "ha iniziato a seguirti";
    case "reply":   return "ha risposto alla tua richiesta";
  }
}

function notifHref(n: Notif): string | null {
  if (n.type === "follow") return null;
  if (n.recommendation_id) return "/feed";
  if (n.request_id) return "/requests";
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationsDrawer({
  open,
  onOpenChange,
  onMarkAllRead,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onMarkAllRead: () => void;
}) {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    async function load() {
      const supabase = createClient();

      const { data: rows } = await supabase
        .from("notifications")
        .select("id, type, actor_id, recommendation_id, request_id, read, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!rows || rows.length === 0) {
        setNotifs([]);
        setLoading(false);
        return;
      }

      const actorIds = [...new Set(rows.map((r) => r.actor_id as string))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .in("id", actorIds);

      const pMap = new Map((profiles ?? []).map((p) => [p.id as string, p]));

      const list: Notif[] = rows.map((r) => {
        const actor = pMap.get(r.actor_id as string);
        return {
          id: r.id as string,
          type: r.type as Notif["type"],
          actor_id: r.actor_id as string,
          recommendation_id: r.recommendation_id as string | null,
          request_id: r.request_id as string | null,
          read: r.read as boolean,
          created_at: r.created_at as string,
          actor_name: (actor?.full_name as string | null) ?? null,
          actor_username: (actor?.username as string | null) ?? null,
          actor_avatar: (actor?.avatar_url as string | null) ?? null,
        };
      });

      setNotifs(list);
      setLoading(false);

      // Mark all as read in background
      const hasUnread = list.some((n) => !n.read);
      if (hasUnread) {
        await supabase
          .from("notifications")
          .update({ read: true })
          .eq("read", false);
        setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
        onMarkAllRead();
      }
    }

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="notifs-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-[55] bg-black/50"
          />

          {/* Sheet */}
          <motion.div
            key="notifs-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-[60] flex max-h-[75vh] flex-col rounded-t-3xl bg-[#111111]"
          >
            {/* Handle */}
            <div className="flex shrink-0 justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-[#2a2a2a]" />
            </div>

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-2">
              <p className="text-base font-bold text-white">Notifiche</p>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a1a] text-[#6b7280] transition hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="h-px bg-[#1a1a1a] shrink-0" />

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0D9488] border-t-transparent" />
                </div>
              ) : notifs.length === 0 ? (
                <p className="py-12 text-center text-sm text-[#6b7280]">Nessuna notifica ancora.</p>
              ) : (
                <div className="space-y-1">
                  {notifs.map((n) => {
                    const name = n.actor_name ?? "Utente";
                    const href = notifHref(n);
                    const profileHref = n.actor_username ? `/p/${n.actor_username}` : null;

                    const inner = (
                      <div className={`flex items-start gap-3 rounded-2xl px-3 py-3 ${!n.read ? "bg-[#0D9488]/10" : ""}`}>
                        {/* Avatar */}
                        {profileHref ? (
                          <Link href={profileHref} onClick={() => onOpenChange(false)} className="shrink-0">
                            <AvatarCircle name={name} avatarUrl={n.actor_avatar} seed={n.actor_id} />
                          </Link>
                        ) : (
                          <div className="shrink-0">
                            <AvatarCircle name={name} avatarUrl={n.actor_avatar} seed={n.actor_id} />
                          </div>
                        )}

                        {/* Text */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug text-white">
                            <span className="font-semibold">{name.split(" ")[0]}</span>{" "}
                            <span className="text-[#9ca3af]">{notifBody(n.type)}</span>
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#6b7280]">{timeAgo(n.created_at)}</p>
                        </div>

                        {/* Unread dot */}
                        {!n.read && (
                          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0D9488]" />
                        )}
                      </div>
                    );

                    return href ? (
                      <Link key={n.id} href={href} onClick={() => onOpenChange(false)}>
                        {inner}
                      </Link>
                    ) : (
                      <div key={n.id}>{inner}</div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function AvatarCircle({ name, avatarUrl, seed }: { name: string; avatarUrl: string | null; seed: string }) {
  return (
    <div className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${avatarColor(seed)}`}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs font-bold text-white">{initials(name)}</span>
      )}
    </div>
  );
}
