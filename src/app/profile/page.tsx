"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/browser";
import { BottomNav } from "@/components/BottomNav";

const AVATAR_COLORS = [
  "from-teal-600 to-cyan-500",
  "from-blue-600 to-indigo-500",
  "from-emerald-600 to-teal-500",
  "from-rose-600 to-pink-500",
  "from-amber-600 to-orange-500",
  "from-cyan-600 to-blue-500",
  "from-fuchsia-600 to-violet-500",
  "from-violet-600 to-purple-500",
];

function avatarGradient(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffff;
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
      .join("") || "U"
  );
}

type Rec = {
  id: string;
  professional_name: string;
  category: string;
  city: string;
  note: string | null;
};

type DrawerUser = {
  id: string;
  full_name: string | null;
  username: string | null;
  city: string | null;
  avatar_url: string | null;
};

const CATEGORY_COLORS: Record<string, string> = {
  dentista: "bg-blue-500/15 text-blue-300",
  medico: "bg-teal-500/15 text-teal-300",
  avvocato: "bg-amber-500/15 text-amber-300",
  commercialista: "bg-orange-500/15 text-orange-300",
  idraulico: "bg-cyan-500/15 text-cyan-300",
  elettricista: "bg-yellow-500/15 text-yellow-300",
  altro: "bg-[#232340] text-[#8b8fa8]",
};

// ─── Follows Drawer ───────────────────────────────────────────────────────────

function FollowsDrawer({
  type,
  users,
  loading,
  followingIds,
  currentUserId,
  onClose,
  onFollow,
  onUnfollow,
}: {
  type: "following" | "followers";
  users: DrawerUser[];
  loading: boolean;
  followingIds: string[];
  currentUserId: string;
  onClose: () => void;
  onFollow: (id: string) => void;
  onUnfollow: (id: string) => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const title = type === "following" ? "Seguiti" : "Follower";

  // Close on backdrop tap
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleBackdrop}
    >
      <motion.div
        ref={sheetRef}
        className="w-full max-w-[430px] rounded-t-[20px] bg-[#111111]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[#2a2a2a]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a1a1a] px-5 py-3">
          <span className="text-[15px] font-bold text-white">{title}</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a1a] text-[#6b7280] transition hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="max-h-[70vh] overflow-y-auto px-4 pb-8 pt-2">
          {loading ? (
            <div className="flex flex-col gap-3 pt-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-3 py-1">
                  <div className="h-11 w-11 shrink-0 rounded-full bg-[#1a1a1a]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-28 rounded-full bg-[#1a1a1a]" />
                    <div className="h-3 w-20 rounded-full bg-[#1a1a1a]" />
                  </div>
                  <div className="h-8 w-20 rounded-full bg-[#1a1a1a]" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#6b7280]">
              {type === "following"
                ? "Non segui ancora nessuno."
                : "Nessun follower ancora."}
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-[#1a1a1a]">
              {users.map((u) => {
                const name = u.full_name ?? "Utente";
                const color = avatarGradient(u.id);
                const isFollowing = followingIds.includes(u.id);
                const isMe = u.id === currentUserId;

                return (
                  <div key={u.id} className="flex items-center gap-3 py-3">
                    {/* Avatar */}
                    {u.username ? (
                      <Link href={`/p/${u.username}`} onClick={onClose}>
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${color}`}
                        >
                          {u.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={u.avatar_url} alt={name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-white">{initials(name)}</span>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${color}`}
                      >
                        {u.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatar_url} alt={name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-white">{initials(name)}</span>
                        )}
                      </div>
                    )}

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      {u.username ? (
                        <Link href={`/p/${u.username}`} onClick={onClose}>
                          <p className="truncate text-[14px] font-semibold text-white transition hover:text-[#0D9488]">
                            {name}
                          </p>
                        </Link>
                      ) : (
                        <p className="truncate text-[14px] font-semibold text-white">{name}</p>
                      )}
                      {u.username && (
                        <p className="truncate text-[12px] text-[#5c5f7a]">@{u.username}</p>
                      )}
                      {u.city && (
                        <p className="truncate text-[12px] text-[#6b7280]">{u.city}</p>
                      )}
                    </div>

                    {/* Action */}
                    {!isMe && (
                      type === "following" ? (
                        <button
                          type="button"
                          onClick={() => onUnfollow(u.id)}
                          className="h-8 shrink-0 rounded-full border border-[#232340] px-3.5 text-xs font-semibold text-[#8b8fa8] transition hover:border-red-500/40 hover:text-red-400"
                        >
                          Smetti
                        </button>
                      ) : isFollowing ? (
                        <button
                          type="button"
                          onClick={() => onUnfollow(u.id)}
                          className="h-8 shrink-0 rounded-full border border-[#232340] px-3.5 text-xs font-semibold text-[#8b8fa8] transition hover:border-red-500/40 hover:text-red-400"
                        >
                          Seguito
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onFollow(u.id)}
                          className="h-8 shrink-0 rounded-full bg-[#0D9488] px-3.5 text-xs font-semibold text-white shadow-[0_0_10px_rgba(13,148,136,0.25)] transition hover:bg-[#0b7c76]"
                        >
                          Segui
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [recs, setRecs] = useState<Rec[]>([]);
  const [accountType, setAccountType] = useState<string>("user");
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [followerIds, setFollowerIds] = useState<string[]>([]);

  // Drawer state
  const [drawerType, setDrawerType] = useState<"following" | "followers" | null>(null);
  const [drawerUsers, setDrawerUsers] = useState<DrawerUser[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error || !user) {
          router.push("/login");
          return;
        }

        const [
          { data: profile },
          { data: myRecs },
          { data: following },
          { data: followers },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, city, avatar_url, bio, account_type")
            .eq("id", user.id)
            .single(),
          supabase
            .from("recommendations")
            .select("id, professional_name, category, city, note")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", user.id),
          supabase
            .from("follows")
            .select("follower_id")
            .eq("following_id", user.id),
        ]);

        const name =
          (profile as { full_name?: string | null } | null)?.full_name ??
          user.user_metadata?.full_name ??
          "Utente";
        setUserId(user.id);
        setFullName(name);
        setCity((profile as { city?: string | null } | null)?.city ?? "");
        setAvatarUrl(
          (profile as { avatar_url?: string | null } | null)?.avatar_url ?? "",
        );
        setBio((profile as { bio?: string | null } | null)?.bio ?? "");
        setAccountType((profile as { account_type?: string | null } | null)?.account_type ?? "user");
        setRecs((myRecs ?? []) as Rec[]);
        setFollowingIds(
          (following ?? []).map((f) => f.following_id as string).filter(Boolean),
        );
        setFollowerIds(
          (followers ?? []).map((f) => f.follower_id as string).filter(Boolean),
        );
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openDrawer(type: "following" | "followers") {
    setDrawerType(type);
    setDrawerUsers([]);
    setDrawerLoading(true);

    const ids = type === "following" ? followingIds : followerIds;

    if (ids.length === 0) {
      setDrawerLoading(false);
      return;
    }

    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, username, city, avatar_url")
      .in("id", ids);

    setDrawerUsers((data ?? []) as DrawerUser[]);
    setDrawerLoading(false);
  }

  async function handleFollow(targetId: string) {
    setFollowingIds((prev) => [...prev, targetId]);
    const supabase = createClient();
    await supabase
      .from("follows")
      .insert({ follower_id: userId, following_id: targetId });
    await supabase
      .from("notifications")
      .insert({ user_id: targetId, type: "follow", actor_id: userId });
  }

  async function handleUnfollow(targetId: string) {
    setFollowingIds((prev) => prev.filter((id) => id !== targetId));
    // If unfollowing from the "following" drawer, also remove from drawer list
    if (drawerType === "following") {
      setDrawerUsers((prev) => prev.filter((u) => u.id !== targetId));
    }
    const supabase = createClient();
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", userId)
      .eq("following_id", targetId);
  }

  const gradient = avatarGradient(fullName || "U");

  if (loading) {
    return (
      <div className="min-h-svh bg-[#0d0d17] text-white">
        <header className="sticky top-0 z-40 bg-[#0d0d17]/95 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-[430px] items-center justify-between px-4">
            <div className="h-4 w-28 animate-pulse rounded-full bg-[#1a1a1a]" />
            <div className="h-5 w-5 animate-pulse rounded bg-[#1a1a1a]" />
          </div>
        </header>

        <main className="mx-auto max-w-[430px] pb-28">
          <div className="px-5 pb-6 pt-5">
            <div className="flex animate-pulse items-center gap-5">
              <div className="h-[76px] w-[76px] shrink-0 rounded-full bg-[#1a1a1a]" />
              <div className="flex flex-1 justify-around">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="h-5 w-8 rounded-full bg-[#1a1a1a]" />
                    <div className="h-3 w-12 rounded-full bg-[#1a1a1a]" />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 h-3 w-20 animate-pulse rounded-full bg-[#1a1a1a]" />
            <div className="mt-2 animate-pulse space-y-1.5">
              <div className="h-3 w-full rounded-full bg-[#1a1a1a]" />
              <div className="h-3 w-3/4 rounded-full bg-[#1a1a1a]" />
            </div>
          </div>

          <div className="h-px bg-[#232340]" />

          <div className="px-4 pt-4">
            <div className="flex animate-pulse items-center justify-between pb-3">
              <div className="h-3 w-24 rounded-full bg-[#1a1a1a]" />
              <div className="h-7 w-20 rounded-full bg-[#1a1a1a]" />
            </div>
            <div className="flex flex-col gap-2.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-[#232340] bg-[#16162a] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-4 w-36 rounded-full bg-[#1a1a1a]" />
                    <div className="h-5 w-16 rounded-full bg-[#1a1a1a]" />
                  </div>
                  <div className="mt-2 h-3 w-16 rounded-full bg-[#1a1a1a]" />
                  <div className="mt-2 space-y-1.5">
                    <div className="h-3 w-full rounded-full bg-[#1a1a1a]" />
                    <div className="h-3 w-2/3 rounded-full bg-[#1a1a1a]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-svh bg-[#0d0d17] text-white">
        <header className="sticky top-0 z-40 bg-[#0d0d17]/95 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-[430px] items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold">{fullName}</span>
              {accountType === "professional" && (
                <span className="rounded-full bg-[#0D9488]/15 px-2 py-[2px] text-[10px] font-semibold text-[#0D9488]">
                  Professionista
                </span>
              )}
            </div>
            <Link href="/settings" aria-label="Impostazioni">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-5 w-5 text-[#8b8fa8] transition hover:text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-[430px] pb-28">
          {/* Profile hero */}
          <div className="px-5 pb-6 pt-5">
            <div className="flex items-center gap-5">
              <div
                className={`relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-full bg-gradient-to-br ${gradient} ring-2 ring-teal-500/30 ring-offset-2 ring-offset-[#0d0d17]`}
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={fullName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                    {initials(fullName)}
                  </span>
                )}
              </div>

              <div className="flex flex-1 justify-around">
                <div className="text-center">
                  <p className="text-[18px] font-bold leading-none">
                    {recs.length}
                  </p>
                  <p className="mt-1 text-[11px] text-[#8b8fa8]">consigli</p>
                </div>
                <button
                  type="button"
                  onClick={() => openDrawer("following")}
                  className="text-center transition active:opacity-70"
                >
                  <p className="text-[18px] font-bold leading-none">
                    {followingIds.length}
                  </p>
                  <p className="mt-1 text-[11px] text-[#8b8fa8]">seguiti</p>
                </button>
                <button
                  type="button"
                  onClick={() => openDrawer("followers")}
                  className="text-center transition active:opacity-70"
                >
                  <p className="text-[18px] font-bold leading-none">
                    {followerIds.length}
                  </p>
                  <p className="mt-1 text-[11px] text-[#8b8fa8]">follower</p>
                </button>
              </div>
            </div>

            {city ? (
              <p className="mt-3 text-[13px] text-[#8b8fa8]">{city}</p>
            ) : null}
            {bio ? (
              <p className="mt-1.5 text-[14px] leading-relaxed text-[#c4c8d8]">
                {bio}
              </p>
            ) : null}
          </div>

          <div className="h-px bg-[#232340]" />

          {/* Recommendations */}
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between pb-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#5c5f7a]">
                Raccomandazioni
              </span>
              <Link
                href="/add"
                className="flex h-7 items-center gap-1.5 rounded-full bg-[#0D9488] px-3 text-[11px] font-semibold text-white transition hover:bg-[#0b7c76]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  className="h-3.5 w-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Aggiungi
              </Link>
            </div>

            {recs.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-[#8b8fa8]">
                  Nessuna raccomandazione ancora.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recs.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-[#232340] bg-[#16162a] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-semibold leading-tight text-white">
                        {r.professional_name}
                      </h2>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CATEGORY_COLORS[r.category] ?? CATEGORY_COLORS.altro}`}
                      >
                        {r.category.charAt(0).toUpperCase() +
                          r.category.slice(1)}
                      </span>
                    </div>
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-[#8b8fa8]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-3 w-3 shrink-0 text-teal-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.333 0-4.36-3.515-7.498-7.5-7.498S4.5 7.64 4.5 12c0 3.636 1.556 6.33 3.5 8.333a19.583 19.583 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {r.city}
                    </p>
                    {r.note ? (
                      <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#8b8fa8]">
                        {r.note}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <BottomNav />
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {drawerType && (
          <FollowsDrawer
            type={drawerType}
            users={drawerUsers}
            loading={drawerLoading}
            followingIds={followingIds}
            currentUserId={userId}
            onClose={() => setDrawerType(null)}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
          />
        )}
      </AnimatePresence>
    </>
  );
}
