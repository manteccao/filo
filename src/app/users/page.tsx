import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { followUser, unfollowUser } from "./actions";

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
    <div className="flex min-h-[calc(100vh-0px)] flex-1 flex-col bg-black text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6">
          <a href="/feed" className="text-sm font-semibold tracking-tight">
            Filo
          </a>
          <span className="text-xs text-zinc-500">Persone</span>
          <a
            href="/profile"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/40 text-sm text-zinc-200 transition hover:bg-zinc-900"
            aria-label="Profilo"
          >
            <span className="h-2 w-2 rounded-full bg-zinc-600" />
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <h1 className="text-xl font-semibold tracking-tight">Persone su Filo</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Segui altre persone per vedere le loro raccomandazioni nel tuo feed.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {(profiles ?? [])
            .filter((p) => p.id !== user.id)
            .map((p) => {
              const isFollowing = followingIds.has(p.id);

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-100">
                      {p.full_name ?? "Senza nome"}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {p.city ?? "Città non specificata"}
                    </span>
                  </div>

                  <form
                    action={isFollowing ? unfollowUser : followUser}
                    className="shrink-0"
                  >
                    <input type="hidden" name="targetUserId" value={p.id} />
                    <button
                      type="submit"
                      className={`inline-flex h-9 items-center justify-center rounded-xl px-4 text-xs font-medium transition ${
                        isFollowing
                          ? "border border-white/10 bg-zinc-900/60 text-zinc-100 hover:bg-zinc-900"
                          : "bg-white text-black hover:bg-zinc-200"
                      }`}
                    >
                      {isFollowing ? "Smetti di seguire" : "Segui"}
                    </button>
                  </form>
                </div>
              );
            })}
        </div>
      </main>
    </div>
  );
}

