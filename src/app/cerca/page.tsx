import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { CercaClient, type UserProfile, type ProProfile, type FofProfile } from "./CercaClient";

function normalizeCity(city: string | null | undefined): string {
  return city?.toLowerCase().trim() ?? "";
}

export default async function CercaPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?redirectTo=/cerca");

  const userId = user.id;

  const [{ data: myProfileData }, { data: follows }, { data: profilesData }] =
    await Promise.all([
      supabase.from("profiles").select("city, full_name").eq("id", userId).single(),
      supabase.from("follows").select("following_id").eq("follower_id", userId),
      supabase
        .from("profiles")
        .select(
          "id,full_name,city,username,avatar_url,account_type,professional_category",
        ),
    ]);

  const myCity =
    (myProfileData as { city?: string | null } | null)?.city?.trim() ?? null;
  const myCityNorm = normalizeCity(myCity);

  // Debug log — visible in Vercel logs
  console.log("[cerca] userId:", userId);
  console.log("[cerca] myCity:", myCity, "| myCityNorm:", myCityNorm);
  console.log("[cerca] total profiles fetched:", profilesData?.length ?? 0);

  const followingIds = (follows ?? [])
    .map((f) => f.following_id as string)
    .filter(Boolean);
  const followingSet = new Set(followingIds);

  const allProfiles = profilesData ?? [];

  // Build a lookup map: id → profile
  const profileById = new Map(allProfiles.map((p) => [p.id as string, p]));

  // Name map for follows (to show "Seguito da Mario")
  const followingNameById = new Map<string, string>(
    followingIds
      .map((id) => {
        const p = profileById.get(id);
        return p?.full_name ? ([id, p.full_name as string] as [string, string]) : null;
      })
      .filter((e): e is [string, string] => e !== null),
  );

  // ── Same-city users (account_type = 'user') ───────────────────────────────
  const sameCityUsers: UserProfile[] = myCityNorm
    ? allProfiles
        .filter(
          (p) =>
            p.id !== userId &&
            (p as { account_type?: string | null }).account_type === "user" &&
            p.full_name &&
            normalizeCity(p.city as string | null) === myCityNorm,
        )
        .map((p) => ({
          id: p.id as string,
          full_name: p.full_name as string,
          city: p.city as string | null,
          username: p.username as string | null,
          avatar_url: p.avatar_url as string | null,
        }))
        .slice(0, 50)
    : [];

  console.log("[cerca] sameCityUsers:", sameCityUsers.length);

  // ── Same-city professionals (account_type = 'professional') ──────────────
  const sameCityPros: ProProfile[] = myCityNorm
    ? allProfiles
        .filter(
          (p) =>
            p.id !== userId &&
            (p as { account_type?: string | null }).account_type ===
              "professional" &&
            p.full_name &&
            normalizeCity(p.city as string | null) === myCityNorm,
        )
        .map((p) => ({
          id: p.id as string,
          full_name: p.full_name as string,
          city: p.city as string | null,
          username: p.username as string | null,
          avatar_url: p.avatar_url as string | null,
          professional_category: (
            p as { professional_category?: string | null }
          ).professional_category ?? null,
        }))
        .slice(0, 50)
    : [];

  // ── Friends of friends (2° grado) ─────────────────────────────────────────
  const secondDegreeResult =
    followingIds.length > 0
      ? await supabase
          .from("follows")
          .select("follower_id,following_id")
          .in("follower_id", followingIds)
      : { data: [] as { follower_id: string; following_id: string }[] };

  // Map: targetId → Set<viaFriendId>
  const fofMap = new Map<string, Set<string>>();
  for (const f of secondDegreeResult.data ?? []) {
    const target = f.following_id as string;
    const via = f.follower_id as string;
    if (target === userId) continue; // exclude self
    if (followingSet.has(target)) continue; // exclude already-followed
    if (!fofMap.has(target)) fofMap.set(target, new Set());
    fofMap.get(target)!.add(via);
  }

  const friendsOfFriends: FofProfile[] = Array.from(fofMap.entries())
    .map(([targetId, viaIds]) => {
      const p = profileById.get(targetId);
      if (!p?.full_name) return null;
      // Pick first friend who follows them
      const viaId = Array.from(viaIds)[0];
      const viaName = viaId ? (followingNameById.get(viaId) ?? "un amico") : "un amico";
      return {
        id: targetId,
        full_name: p.full_name as string,
        city: p.city as string | null,
        username: p.username as string | null,
        avatar_url: p.avatar_url as string | null,
        followed_by: viaName.split(" ")[0], // first name only
      } satisfies FofProfile;
    })
    .filter((u): u is FofProfile => u !== null)
    .slice(0, 30);

  console.log("[cerca] friendsOfFriends:", friendsOfFriends.length);

  return (
    <CercaClient
      myCity={myCity}
      sameCityUsers={sameCityUsers}
      sameCityPros={sameCityPros}
      friendsOfFriends={friendsOfFriends}
      followingIds={followingIds}
    />
  );
}
