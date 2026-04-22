"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { createClient } from "@/lib/supabase/browser";
import { BottomNav } from "@/components/BottomNav";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserProfile = {
  id: string;
  full_name: string;
  city: string | null;
  username: string | null;
  avatar_url: string | null;
};

export type ProProfile = {
  id: string;
  full_name: string;
  city: string | null;
  username: string | null;
  avatar_url: string | null;
  profession: string | null;
};

export type FofProfile = UserProfile & {
  followed_by: string; // primo nome dell'amico che li segue
};

// Keep for backwards-compat if anything else imports these
export type UserCard = UserProfile & { rec_count: number; mutual_friends: string[] };
export type ProRecommender = { id: string; full_name: string; username: string | null; avatar_url: string | null; mutual_friend?: string };
export type ProCard = { slug: string; professional_name: string; category: string; city: string | null; rec_count: number; price_range: string | null; recommenders: ProRecommender[] };

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

const CATEGORY_PILLS = [
  "Tutti",
  "Dentista",
  "Medico",
  "Avvocato",
  "Commercialista",
  "Notaio",
  "Architetto",
  "Idraulico",
  "Elettricista",
  "Fisioterapista",
  "Psicologo",
  "Nutrizionista",
  "Personal trainer",
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

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  profile,
  size = "md",
}: {
  profile: { id: string; full_name: string; avatar_url: string | null };
  size?: "sm" | "md";
}) {
  const color = avatarColor(profile.id);
  const cls =
    size === "sm"
      ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white overflow-hidden"
      : "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white overflow-hidden";
  return (
    <div className={`${cls} bg-gradient-to-br ${color}`}>
      {profile.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatar_url}
          alt={profile.full_name}
          className="h-full w-full object-cover"
        />
      ) : (
        initials(profile.full_name)
      )}
    </div>
  );
}

// ─── Person Card ──────────────────────────────────────────────────────────────

function PersonCard({
  user,
  isFollowing,
  onToggle,
  index,
  badge,
}: {
  user: UserProfile;
  isFollowing: boolean;
  onToggle: (id: string, follow: boolean) => void;
  index: number;
  badge?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function handleFollow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    onToggle(user.id, !isFollowing);
    const supabase = createClient();
    const {
      data: { user: me },
    } = await supabase.auth.getUser();
    if (!me) {
      onToggle(user.id, isFollowing);
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

  const profileHref = user.username ? `/p/${user.username}` : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex items-center gap-3.5 rounded-2xl bg-[#111111] px-4 py-3.5"
    >
      {/* Left: avatar + info (clickable) */}
      {profileHref ? (
        <Link
          href={profileHref}
          className="flex min-w-0 flex-1 items-center gap-3.5"
        >
          <Avatar profile={user} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-white">
              {user.full_name}
            </p>
            {user.city && (
              <p className="truncate text-[12px] text-[#6b7280]">{user.city}</p>
            )}
            {badge && (
              <p className="mt-0.5 truncate text-[11px] font-medium text-[#0D9488]">
                {badge}
              </p>
            )}
          </div>
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          <Avatar profile={user} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-white">
              {user.full_name}
            </p>
            {user.city && (
              <p className="truncate text-[12px] text-[#6b7280]">{user.city}</p>
            )}
            {badge && (
              <p className="mt-0.5 truncate text-[11px] font-medium text-[#0D9488]">
                {badge}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Follow button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={handleFollow}
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

// ─── Pro Profile Card ─────────────────────────────────────────────────────────

function ProProfileCard({ pro, index }: { pro: ProProfile; index: number }) {
  const href = pro.username ? `/p/${pro.username}` : undefined;

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex items-center gap-3.5 rounded-2xl bg-[#111111] px-4 py-3.5 transition active:opacity-80"
    >
      <Avatar profile={pro} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-white">
          {pro.full_name}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          {pro.profession && (
            <span className="rounded-full bg-[#0D9488]/15 px-2 py-[2px] text-[11px] font-medium text-[#0D9488]">
              {capitalize(pro.profession)}
            </span>
          )}
          {pro.city && (
            <span className="text-[12px] text-[#6b7280]">{pro.city}</span>
          )}
        </div>
      </div>
      {href && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-4 w-4 shrink-0 text-[#3a3a3a]"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      )}
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
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

// ─── Category Pills ───────────────────────────────────────────────────────────

function CategoryPills({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (c: string) => void;
}) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      {CATEGORY_PILLS.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
            selected === cat
              ? "bg-[#0D9488] text-white"
              : "bg-[#111111] text-[#6b7280] hover:text-white"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

// ─── Search Input ─────────────────────────────────────────────────────────────

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-[#1a1a1a] bg-[#111111] pl-9 pr-4 text-sm text-white placeholder:text-[#5c5f7a] outline-none transition focus:border-[#0D9488]"
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function normalizeCity(city: string | null | undefined): string {
  return city?.toLowerCase().trim() ?? "";
}

export function CercaClient({
  userId,
  myCity,
  followingIds,
}: {
  userId: string;
  myCity: string | null;
  followingIds: string[];
}) {
  const [tab, setTab] = useState<"persone" | "professionisti">("persone");
  const [userQuery, setUserQuery] = useState("");
  const [proQuery, setProQuery] = useState("");
  const [followedSet, setFollowedSet] = useState(() => new Set(followingIds));
  const [categoryFilter, setCategoryFilter] = useState("Tutti");

  // Profiles fetched client-side (browser JWT → RLS works correctly)
  const [sameCityUsers, setSameCityUsers] = useState<UserProfile[]>([]);
  const [sameCityPros, setSameCityPros] = useState<ProProfile[]>([]);
  const [allOtherUsers, setAllOtherUsers] = useState<UserProfile[]>([]);
  const [friendsOfFriends, setFriendsOfFriends] = useState<FofProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      const supabase = createClient();
      const myCityNorm = normalizeCity(myCity);
      const followingSet = new Set(followingIds);

      console.log("[cerca client] myCity:", myCity, "myCityNorm:", myCityNorm);

      const { data, error } = await supabase
        .from("profiles")
        .select("id,full_name,city,username,avatar_url,account_type,profession");

      console.log("[cerca client] profiles fetched:", data?.length ?? 0, "error:", error);

      if (!data) { setProfilesLoading(false); return; }

      const profileById = new Map(data.map((p) => [p.id as string, p]));

      // Same-city users
      const sameCitySet = new Set<string>();
      const users: UserProfile[] = myCityNorm
        ? data
            .filter((p) => {
              if (p.id === userId || !p.full_name) return false;
              if ((p as { account_type?: string | null }).account_type !== "user") return false;
              return normalizeCity(p.city as string | null) === myCityNorm;
            })
            .map((p) => {
              sameCitySet.add(p.id as string);
              return {
                id: p.id as string,
                full_name: p.full_name as string,
                city: p.city as string | null,
                username: p.username as string | null,
                avatar_url: p.avatar_url as string | null,
              };
            })
            .slice(0, 50)
        : [];

      // Same-city pros
      const pros: ProProfile[] = myCityNorm
        ? data
            .filter((p) => {
              if (p.id === userId || !p.full_name) return false;
              if ((p as { account_type?: string | null }).account_type !== "professional") return false;
              return normalizeCity(p.city as string | null) === myCityNorm;
            })
            .map((p) => ({
              id: p.id as string,
              full_name: p.full_name as string,
              city: p.city as string | null,
              username: p.username as string | null,
              avatar_url: p.avatar_url as string | null,
              profession: (p as { profession?: string | null }).profession ?? null,
            }))
            .slice(0, 50)
        : [];

      // Tutti gli altri utenti (escluso stesso utente e già mostrati in same-city)
      const others: UserProfile[] = data
        .filter((p) => p.id !== userId && p.full_name && !sameCitySet.has(p.id as string))
        .map((p) => ({
          id: p.id as string,
          full_name: p.full_name as string,
          city: p.city as string | null,
          username: p.username as string | null,
          avatar_url: p.avatar_url as string | null,
        }))
        .slice(0, 50);

      console.log("[cerca client] sameCityUsers:", users.length, "sameCityPros:", pros.length, "allOthers:", others.length);

      // Friends of friends
      let fof: FofProfile[] = [];
      if (followingIds.length > 0) {
        const { data: fofData } = await supabase
          .from("follows")
          .select("follower_id,following_id")
          .in("follower_id", followingIds);

        const followingNameById = new Map<string, string>(
          followingIds
            .map((id) => {
              const p = profileById.get(id);
              return p?.full_name ? ([id, p.full_name as string] as [string, string]) : null;
            })
            .filter((e): e is [string, string] => e !== null),
        );

        const fofMap = new Map<string, Set<string>>();
        for (const f of fofData ?? []) {
          const target = f.following_id as string;
          const via = f.follower_id as string;
          if (target === userId) continue;
          if (followingSet.has(target)) continue;
          if (!fofMap.has(target)) fofMap.set(target, new Set());
          fofMap.get(target)!.add(via);
        }

        fof = Array.from(fofMap.entries())
          .map(([targetId, viaIds]) => {
            const p = profileById.get(targetId);
            if (!p?.full_name) return null;
            const viaId = Array.from(viaIds)[0];
            const viaName = viaId ? (followingNameById.get(viaId) ?? "un amico") : "un amico";
            return {
              id: targetId,
              full_name: p.full_name as string,
              city: p.city as string | null,
              username: p.username as string | null,
              avatar_url: p.avatar_url as string | null,
              followed_by: viaName.split(" ")[0],
            } satisfies FofProfile;
          })
          .filter((u): u is FofProfile => u !== null)
          .slice(0, 30);
      }

      setSameCityUsers(users);
      setSameCityPros(pros);
      setAllOtherUsers(others);
      setFriendsOfFriends(fof);
      setProfilesLoading(false);
    }

    fetchProfiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, myCity]);

  function onToggle(id: string, follow: boolean) {
    setFollowedSet((prev) => {
      const next = new Set(prev);
      if (follow) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  // All unique users across both sections (for search)
  const allUsers = useMemo(() => {
    const seen = new Set<string>();
    const arr: UserProfile[] = [];
    for (const u of [...sameCityUsers, ...friendsOfFriends, ...allOtherUsers]) {
      if (seen.has(u.id)) continue;
      seen.add(u.id);
      arr.push(u);
    }
    return arr;
  }, [sameCityUsers, friendsOfFriends, allOtherUsers]);

  // Filtered users (when search is active, search across all; otherwise show by section)
  const filteredAllUsers = useMemo(() => {
    const q = userQuery.toLowerCase().trim();
    if (!q) return [];
    return allUsers.filter((u) => u.full_name.toLowerCase().includes(q));
  }, [allUsers, userQuery]);

  // Filtered FOF (no search — shown as-is in section)
  const filteredFof = useMemo(() => {
    const q = userQuery.toLowerCase().trim();
    if (!q) return friendsOfFriends;
    return friendsOfFriends.filter((u) => u.full_name.toLowerCase().includes(q));
  }, [friendsOfFriends, userQuery]);

  const filteredCityUsers = useMemo(() => {
    const q = userQuery.toLowerCase().trim();
    if (!q) return sameCityUsers;
    return sameCityUsers.filter((u) => u.full_name.toLowerCase().includes(q));
  }, [sameCityUsers, userQuery]);

  const filteredOtherUsers = useMemo(() => {
    const q = userQuery.toLowerCase().trim();
    if (!q) return allOtherUsers;
    return allOtherUsers.filter((u) => u.full_name.toLowerCase().includes(q));
  }, [allOtherUsers, userQuery]);

  // Filtered pros (by name + category)
  const filteredPros = useMemo(() => {
    const q = proQuery.toLowerCase().trim();
    return sameCityPros.filter((p) => {
      const matchesQuery =
        !q ||
        p.full_name.toLowerCase().includes(q) ||
        (p.profession?.toLowerCase().includes(q) ?? false);
      const matchesCategory =
        categoryFilter === "Tutti" ||
        (p.profession?.toLowerCase() ===
          categoryFilter.toLowerCase());
      return matchesQuery && matchesCategory;
    });
  }, [sameCityPros, proQuery, categoryFilter]);

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="mx-auto max-w-[430px] px-4 pb-3 pt-5">
          {/* Tab toggle */}
          <div className="mb-3 flex rounded-xl bg-[#111111] p-1">
            <button
              type="button"
              onClick={() => setTab("persone")}
              className={`flex-1 rounded-lg py-2 text-[13px] font-semibold transition ${
                tab === "persone"
                  ? "bg-[#0a0a0a] text-white shadow"
                  : "text-[#6b7280] hover:text-white"
              }`}
            >
              Persone
            </button>
            <button
              type="button"
              onClick={() => setTab("professionisti")}
              className={`flex-1 rounded-lg py-2 text-[13px] font-semibold transition ${
                tab === "professionisti"
                  ? "bg-[#0a0a0a] text-white shadow"
                  : "text-[#6b7280] hover:text-white"
              }`}
            >
              Professionisti
            </button>
          </div>

          {/* Search */}
          {tab === "persone" && (
            <SearchInput
              value={userQuery}
              onChange={setUserQuery}
              placeholder="Cerca per nome e cognome…"
            />
          )}
          {tab === "professionisti" && (
            <div className="flex flex-col gap-2">
              <SearchInput
                value={proQuery}
                onChange={setProQuery}
                placeholder="Cerca per nome o professione…"
              />
              <CategoryPills
                selected={categoryFilter}
                onChange={setCategoryFilter}
              />
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-28">
        {profilesLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
        ) : tab === "persone" ? (
          <>
            {/* Quando c'è una ricerca attiva, mostra risultati globali */}
            {userQuery ? (
              filteredAllUsers.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-[#6b7280]">
                    Nessun risultato per &ldquo;{userQuery}&rdquo;
                  </p>
                </div>
              ) : (
                <>
                  <SectionHeader title="Risultati" count={filteredAllUsers.length} />
                  <div className="flex flex-col gap-2">
                    {filteredAllUsers.map((u, i) => (
                      <PersonCard
                        key={u.id}
                        user={u}
                        isFollowing={followedSet.has(u.id)}
                        onToggle={onToggle}
                        index={i}
                      />
                    ))}
                  </div>
                </>
              )
            ) : (
              <>
                {/* Sezione 1: Nella tua città */}
                <SectionHeader
                  title={myCity ? `Nella tua città · ${myCity}` : "Nella tua città"}
                  count={filteredCityUsers.length}
                />
                {filteredCityUsers.length === 0 ? (
                  <div className="pb-2 text-center">
                    {!myCity ? (
                      <p className="text-sm text-[#6b7280]">
                        Imposta la tua città nelle{" "}
                        <a href="/settings" className="text-[#0D9488] underline">
                          impostazioni
                        </a>{" "}
                        per vedere chi è vicino a te.
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-[#6b7280]">
                          Nessun utente trovato nella tua città.
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#0D9488]">
                          Invita i tuoi amici!
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filteredCityUsers.map((u, i) => (
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

                {/* Sezione 2: Amici di amici */}
                <SectionHeader
                  title="Persone che potresti conoscere"
                  count={filteredFof.length}
                />
                {filteredFof.length === 0 ? (
                  <p className="pb-4 text-sm text-[#6b7280]">
                    Segui più persone per scoprire nuove connessioni.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filteredFof.map((u, i) => (
                      <PersonCard
                        key={u.id}
                        user={u}
                        isFollowing={followedSet.has(u.id)}
                        onToggle={onToggle}
                        index={filteredCityUsers.length + i}
                        badge={`Seguito da ${u.followed_by}`}
                      />
                    ))}
                  </div>
                )}

                {/* Sezione 3: Tutti gli utenti */}
                {filteredOtherUsers.length > 0 && (
                  <>
                    <SectionHeader
                      title="Tutti gli utenti"
                      count={filteredOtherUsers.length}
                    />
                    <div className="flex flex-col gap-2">
                      {filteredOtherUsers.map((u, i) => (
                        <PersonCard
                          key={u.id}
                          user={u}
                          isFollowing={followedSet.has(u.id)}
                          onToggle={onToggle}
                          index={filteredCityUsers.length + filteredFof.length + i}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        ) : (
          /* ── Professionisti tab ── */
          <>
            <SectionHeader
              title={
                myCity ? `Nella tua città · ${myCity}` : "Nella tua città"
              }
              count={filteredPros.length}
            />
            {filteredPros.length === 0 ? (
              <div className="py-10 text-center">
                {proQuery || categoryFilter !== "Tutti" ? (
                  <p className="text-sm text-[#6b7280]">
                    Nessun professionista trovato
                    {categoryFilter !== "Tutti"
                      ? ` nella categoria "${categoryFilter}"`
                      : ""}
                    {proQuery ? ` per "${proQuery}"` : ""}.
                  </p>
                ) : (
                  <p className="text-sm text-[#6b7280]">
                    Nessun professionista registrato nella tua città ancora.
                    <br />
                    Invita i professionisti che conosci!
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredPros.map((pro, i) => (
                  <ProProfileCard key={pro.id} pro={pro} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
