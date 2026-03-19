import Image from "next/image";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { ShareProfileButton } from "./ShareProfileButton";
import { InviteFriendsSection } from "./InviteFriendsSection";

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
  return parts.map((p) => p[0]?.toUpperCase()).filter(Boolean).join("") || "U";
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  const user = data.user;
  const fullName = String(user.user_metadata?.full_name ?? "Utente");
  const city = String(user.user_metadata?.city ?? "");
  const avatarUrl = String(user.user_metadata?.avatar_url ?? "");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const username = profile?.username ?? null;
  const color = avatarColor(fullName);

  return (
    <div className="min-h-svh bg-[#0a0a0a] text-white">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-[#222222] bg-[#0a0a0a]">
        <div className="mx-auto flex h-12 max-w-[430px] items-center justify-center px-4">
          <span className="text-base font-bold tracking-tight text-white">Filo</span>
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-24 pt-6">
        {/* Profile header */}
        <div className="flex items-center gap-4">
          <div className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ${color}`}>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`Foto profilo di ${fullName}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                {initials(fullName)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{fullName}</h1>
            {city ? <p className="mt-0.5 text-sm text-[#9CA3AF]">{city}</p> : null}
          </div>
        </div>

        {/* Share profile */}
        {username ? (
          <div className="mt-4">
            <ShareProfileButton username={username} />
          </div>
        ) : null}

        {/* Account info */}
        <div className="mt-5 rounded-2xl border border-[#222222] bg-[#111111] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">Account</p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-sm text-[#9CA3AF]">Email</span>
            <span className="truncate text-sm text-white">{user.email}</span>
          </div>
        </div>

        {/* Invite friends */}
        {username ? (
          <div className="mt-3">
            <InviteFriendsSection username={username} fullName={fullName} />
          </div>
        ) : null}

        {/* Logout */}
        <form action="/auth/signout" method="post" className="mt-5">
          <button
            type="submit"
            className="h-11 w-full rounded-2xl border border-[#222222] bg-[#111111] text-sm font-medium text-[#9CA3AF] transition hover:border-red-500/40 hover:text-red-400"
          >
            Logout
          </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
