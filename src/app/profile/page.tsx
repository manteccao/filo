import Image from "next/image";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const chars = parts.map((p) => p[0]?.toUpperCase()).filter(Boolean);
  return chars.join("") || "U";
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

  return (
    <div className="flex flex-1 items-center justify-center bg-black px-6 py-16 text-zinc-50">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-zinc-950/60 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={`Foto profilo di ${fullName}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-200">
                  {initials(fullName)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-7 tracking-tight">
                {fullName}
              </h1>
              <p className="mt-1 text-sm text-zinc-400">{city}</p>
            </div>
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/50 px-4 text-sm text-zinc-100 transition hover:bg-zinc-900"
            >
              Logout
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs uppercase tracking-wider text-zinc-500">
            Account
          </div>
          <div className="mt-2 text-sm text-zinc-300">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">Email</span>
                <span className="truncate text-right">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

