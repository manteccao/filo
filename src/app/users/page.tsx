import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { followUser, unfollowUser } from "./actions";

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

export default async function UsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?redirectTo=/users");
  }

  const [{ data: profiles }, { data: follows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,full_name,city")
      .order("full_name", { ascending: true }),
    supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id),
  ]);

  const followingIds = new Set((follows ?? []).map((f) => f.following_id));

  return (
    <div className="min-h-svh bg-[#0a0a0a] text-white">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-[#222222] bg-[#0a0a0a]">
        <div className="mx-auto flex h-12 max-w-[430px] items-center justify-center px-4">
          <span className="text-base font-bold tracking-tight text-white">Filo</span>
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-24 pt-6">
        <h1 className="text-xl font-bold tracking-tight">Persone su Filo</h1>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Segui altri utenti per vedere le loro raccomandazioni nel feed.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          {(profiles ?? [])
            .filter((p) => p.id !== user.id)
            .map((p) => {
              const isFollowing = followingIds.has(p.id);
              const name = p.full_name ?? "Senza nome";
              const color = avatarColor(name);

              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl border border-[#222222] bg-[#111111] px-4 py-3"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${color}`}
                  >
                    {initials(name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs text-[#9CA3AF]">
                      {p.city ?? "Città non specificata"}
                    </p>
                  </div>

                  <form action={isFollowing ? unfollowUser : followUser} className="shrink-0">
                    <input type="hidden" name="targetUserId" value={p.id} />
                    <button
                      type="submit"
                      className={`h-8 rounded-full px-4 text-xs font-semibold transition ${
                        isFollowing
                          ? "border border-[#222222] bg-transparent text-[#9CA3AF] hover:border-red-500/50 hover:text-red-400"
                          : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
                      }`}
                    >
                      {isFollowing ? "Segui già" : "Segui"}
                    </button>
                  </form>
                </div>
              );
            })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
