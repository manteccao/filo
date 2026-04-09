"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { createClient } from "@/lib/supabase/browser";
import { BottomNav } from "@/components/BottomNav";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserCard = {
  id: string;
  full_name: string;
  city: string | null;
  rec_count: number;
  mutual_friends: string[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

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

function avatarColor(seed: string) {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .filter(Boolean)
      .join("") || "?"
  );
}

function mutualText(friends: string[]): string | null {
  if (friends.length === 0) return null;
  const first = friends[0].split(" ")[0];
  if (friends.length === 1) return `Amico di ${first}`;
  if (friends.length === 2)
    return `Amici di ${first} e ${friends[1].split(" ")[0]}`;
  return `${friends.length} amici in comune: ${friends
    .slice(0, 2)
    .map((n) => n.split(" ")[0])
    .join(", ")}`;
}

// ─── Person Card ─────────────────────────────────────────────────────────────

function PersonCard({
  user,
  isFollowing,
  onToggle,
  index,
}: {
  user: UserCard;
  isFollowing: boolean;
  onToggle: (id: string, follow: boolean) => void;
  index: number;
}) {
  const [busy, setBusy] = useState(false);
  const color = avatarColor(user.id);
  const mutual = mutualText(user.mutual_friends);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    // Optimistic
    onToggle(user.id, !isFollowing);
    const supabase = createClient();
    const {
      data: { user: me },
    } = await supabase.auth.getUser();
    if (!me) {
      onToggle(user.id, isFollowing); // revert
      setBusy(false);
      return;
    }
    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", me.id)
        .eq("following_id", user.id);
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: me.id, following_id: user.id });
      await supabase
        .from("notifications")
        .insert({ user_id: user.id, type: "follow", actor_id: me.id });
    }
    setBusy(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.28,
        delay: index * 0.04,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="flex items-center gap-3.5 rounded-2xl bg-[#111111] px-4 py-3.5"
    >
      {/* Avatar */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color} text-sm font-bold text-white`}
      >
        {initials(user.full_name)}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-white">
          {user.full_name}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          {user.city && (
            <span className="text-[12px] text-[#6b7280]">{user.city}</span>
          )}
          {user.city && user.rec_count > 0 && (
            <span className="text-[11px] text-[#2a2a2a]">·</span>
          )}
          {user.rec_count > 0 && (
            <span className="text-[12px] text-[#6b7280]">
              {user.rec_count}{" "}
              {user.rec_count === 1 ? "consiglio" : "consigli"}
            </span>
          )}
        </div>
        {mutual && (
          <p className="mt-0.5 text-[11px] font-medium text-[#0D9488]">
            {mutual}
          </p>
        )}
      </div>

      {/* Follow button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={handleClick}
        disabled={busy}
        className={`h-8 shrink-0 rounded-full px-4 text-xs font-semibold transition disabled:opacity-50 ${
          isFollowing
            ? "border border-[#232340] bg-transparent text-[#8b8fa8] hover:border-red-500/30 hover:text-red-400"
            : "bg-[#0D9488] text-white shadow-[0_0_12px_rgba(13,148,136,0.3)] hover:bg-[#0b7c76]"
        }`}
      >
        {busy ? "…" : isFollowing ? "Seguito" : "Segui"}
      </motion.button>
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between pb-3 pt-6 first:pt-2">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#5c5f7a]">
        {title}
      </span>
      {typeof count === "number" && count > 0 && (
        <span className="text-[11px] text-[#3a3a3a]">{count}</span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CercaClient({
  sameCityUsers,
  friendsOfFriends,
  followingIds,
  myCity,
}: {
  currentUserId: string;
  myCity: string | null;
  sameCityUsers: UserCard[];
  friendsOfFriends: UserCard[];
  followingIds: string[];
}) {
  const [query, setQuery] = useState("");
  const [followedSet, setFollowedSet] = useState(() => new Set(followingIds));

  function onToggle(id: string, follow: boolean) {
    setFollowedSet((prev) => {
      const next = new Set(prev);
      if (follow) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  // All unique users across sections (for search)
  const allUsers = useMemo(() => {
    const seen = new Set<string>();
    const arr: UserCard[] = [];
    for (const u of [...sameCityUsers, ...friendsOfFriends]) {
      if (seen.has(u.id)) continue;
      seen.add(u.id);
      arr.push(u);
    }
    return arr;
  }, [sameCityUsers, friendsOfFriends]);

  const q = query.toLowerCase().trim();
  const searchResults = useMemo(
    () =>
      q ? allUsers.filter((u) => u.full_name.toLowerCase().includes(q)) : [],
    [allUsers, q],
  );

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="mx-auto max-w-[430px] px-4 pb-3 pt-5">
          <p className="mb-3 text-[15px] font-bold">Persone</p>
          {/* Search */}
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c5f7a]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca per nome e cognome…"
              className="h-10 w-full rounded-xl border border-[#1a1a1a] bg-[#111111] pl-9 pr-4 text-sm text-white placeholder:text-[#5c5f7a] outline-none transition focus:border-[#0D9488]"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-28">
        {/* ── Search mode ── */}
        {q ? (
          searchResults.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-[#6b7280]">
                Nessun risultato per &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-3">
              {searchResults.map((u, i) => (
                <PersonCard
                  key={u.id}
                  user={u}
                  isFollowing={followedSet.has(u.id)}
                  onToggle={onToggle}
                  index={i}
                />
              ))}
            </div>
          )
        ) : (
          /* ── Browse mode ── */
          <>
            {/* Section 1 — Nella tua città */}
            {myCity && (
              <>
                <SectionHeader
                  title={`Nella tua città · ${myCity}`}
                  count={sameCityUsers.length}
                />
                {sameCityUsers.length === 0 ? (
                  <p className="pb-4 text-sm text-[#6b7280]">
                    Nessun altro utente nella tua città ancora.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {sameCityUsers.map((u, i) => (
                      <PersonCard
                        key={u.id}
                        user={{ ...u, mutual_friends: [] }}
                        isFollowing={followedSet.has(u.id)}
                        onToggle={onToggle}
                        index={i}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Section 2 — Amici di amici */}
            <SectionHeader
              title="Amici di amici"
              count={friendsOfFriends.length}
            />
            {friendsOfFriends.length === 0 ? (
              <p className="pb-4 text-sm text-[#6b7280]">
                Segui più persone per scoprire nuove connessioni.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {friendsOfFriends.map((u, i) => (
                  <PersonCard
                    key={u.id}
                    user={u}
                    isFollowing={followedSet.has(u.id)}
                    onToggle={onToggle}
                    index={i}
                  />
                ))}
              </div>
            )}

            {/* Section 3 — Nella tua rubrica (placeholder) */}
            <SectionHeader title="Nella tua rubrica" />
            <div className="rounded-2xl border border-[#1a1a1a] bg-[#111111] p-5 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1a]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="h-5 w-5 text-[#5c5f7a]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-6 3h.008v.008H6v-.008zm0-3h.008v.008H6v-.008zm0-3h.008v.008H6v-.008z"
                  />
                </svg>
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                Disponibile sull&apos;app mobile
              </p>
              <p className="mt-1 text-xs text-[#6b7280]">
                Troveremo le persone dalla tua rubrica che usano già Filo.
              </p>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
