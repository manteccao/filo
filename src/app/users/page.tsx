import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { followUser, unfollowUser } from "./actions";

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
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?redirectTo=/users");

  const [{ data: profiles }, { data: follows }] = await Promise.all([
    supabase.from("profiles").select("id,full_name,city").order("full_name", { ascending: true }),
    supabase.from("follows").select("following_id").eq("follower_id", user.id),
  ]);

  const followingIds = new Set((follows ?? []).map((f) => f.following_id));
  const others = (profiles ?? []).filter((p) => p.id !== user.id);

  return (
    <div className="min-h-svh bg-[#0d0d17] text-white">
      <header className="sticky top-0 z-40 bg-[#0d0d17]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[430px] items-center justify-center px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/filo-logo-new.png" alt="Filo" className="h-9 w-auto object-contain" />
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-28 pt-2">
        {/* Section header */}
        <div className="flex items-center justify-between py-3">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#5c5f7a]">
            Persone · {others.length}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {others.map((p) => {
            const isFollowing = followingIds.has(p.id);
            const name = p.full_name ?? "Senza nome";
            const color = avatarColor(name);

            return (
              <div
                key={p.id}
                className="flex items-center gap-3.5 rounded-2xl border border-[#232340] bg-[#16162a] px-4 py-3.5"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color} text-sm font-bold text-white`}>
                  {initials(name)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-white">{name}</p>
                  <p className="mt-0.5 text-[12px] text-[#8b8fa8]">
                    {p.city ?? "—"}
                  </p>
                </div>

                <form action={isFollowing ? unfollowUser : followUser} className="shrink-0">
                  <input type="hidden" name="targetUserId" value={p.id} />
                  <button
                    type="submit"
                    className={`h-8 rounded-full px-4 text-xs font-semibold transition ${
                      isFollowing
                        ? "border border-[#232340] bg-transparent text-[#8b8fa8] hover:border-red-500/40 hover:text-red-400"
                        : "bg-[#0D9488] text-white shadow-[0_0_12px_rgba(13,148,136,0.35)] hover:bg-[#0b7c76]"
                    }`}
                  >
                    {isFollowing ? "Seguito" : "Segui"}
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
