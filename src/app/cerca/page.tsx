import { redirect } from "next/navigation";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { CercaClient, type UserCard } from "./CercaClient";

export default async function CercaPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?redirectTo=/cerca");

  const userId = user.id;

  // ── Base data ────────────────────────────────────────────────────────────
  const [
    { data: myProfileData },
    { data: follows },
    { data: blockedData },
  ] = await Promise.all([
    supabase.from("profiles").select("city").eq("id", userId).single(),
    supabase.from("follows").select("following_id").eq("follower_id", userId),
    supabase.from("blocks").select("blocked_user_id").eq("user_id", userId),
  ]);

  const myCity =
    (myProfileData as { city?: string | null } | null)?.city ?? null;
  const followingIds = (follows ?? [])
    .map((f) => f.following_id as string)
    .filter(Boolean);
  const blockedIds = new Set(
    (blockedData ?? []).map((b) => b.blocked_user_id as string).filter(Boolean),
  );
  const excludedIds = new Set([userId, ...followingIds, ...blockedIds]);

  const adminClient = createAdminClient();

  // ── Parallel: same-city profiles, second-degree follows, following names ──
  const [sameCityResult, secondDegreeResult, followingNamesResult] =
    await Promise.all([
      myCity
        ? adminClient
            .from("profiles")
            .select("id,full_name,city")
            .ilike("city", myCity)
        : Promise.resolve({ data: [] as { id: string; full_name: string | null; city: string | null }[] }),
      followingIds.length > 0
        ? supabase
            .from("follows")
            .select("follower_id,following_id")
            .in("follower_id", followingIds)
        : Promise.resolve({ data: [] as { follower_id: string; following_id: string }[] }),
      followingIds.length > 0
        ? adminClient
            .from("profiles")
            .select("id,full_name")
            .in("id", followingIds)
        : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
    ]);

  const followingNameById = new Map(
    (followingNamesResult.data ?? []).map((p) => [
      p.id as string,
      (p.full_name as string | null) ?? "",
    ]),
  );

  // ── Build FOF map: targetId → Set<viaFriendId> ───────────────────────────
  const fofMap = new Map<string, Set<string>>();
  for (const f of secondDegreeResult.data ?? []) {
    const target = f.following_id as string;
    const via = f.follower_id as string;
    if (excludedIds.has(target)) continue;
    if (!fofMap.has(target)) fofMap.set(target, new Set());
    fofMap.get(target)!.add(via);
  }

  const fofIds = Array.from(fofMap.keys());

  // ── Fetch FOF profiles + rec counts ─────────────────────────────────────
  const [fofProfilesResult, recCountResult] = await Promise.all([
    fofIds.length > 0
      ? adminClient
          .from("profiles")
          .select("id,full_name,city")
          .in("id", fofIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null; city: string | null }[] }),
    (() => {
      const relevantIds = Array.from(
        new Set([
          ...(sameCityResult.data ?? [])
            .map((p) => p.id as string)
            .filter((id) => !excludedIds.has(id)),
          ...fofIds,
        ]),
      );
      return relevantIds.length > 0
        ? supabase
            .from("recommendations")
            .select("user_id")
            .in("user_id", relevantIds)
        : Promise.resolve({ data: [] as { user_id: string }[] });
    })(),
  ]);

  // ── Rec count map ─────────────────────────────────────────────────────────
  const recCountMap = new Map<string, number>();
  for (const r of recCountResult.data ?? []) {
    const uid = r.user_id as string;
    recCountMap.set(uid, (recCountMap.get(uid) ?? 0) + 1);
  }

  // ── Section 1: same city ─────────────────────────────────────────────────
  const sameCityUsers: UserCard[] = (sameCityResult.data ?? [])
    .filter((p) => !excludedIds.has(p.id as string) && p.full_name)
    .map((p) => ({
      id: p.id as string,
      full_name: p.full_name as string,
      city: p.city as string | null,
      rec_count: recCountMap.get(p.id as string) ?? 0,
      mutual_friends: [],
    }))
    .slice(0, 20);

  // ── Section 2: friends of friends ────────────────────────────────────────
  const fofProfileById = new Map(
    (fofProfilesResult.data ?? []).map((p) => [p.id as string, p]),
  );

  const friendsOfFriends: UserCard[] = fofIds
    .map((targetId) => {
      const p = fofProfileById.get(targetId);
      if (!p?.full_name) return null;
      const viaIds = Array.from(fofMap.get(targetId)!);
      const mutualFriends = viaIds
        .map((id) => followingNameById.get(id) ?? null)
        .filter((n): n is string => !!n)
        .slice(0, 3);
      return {
        id: targetId,
        full_name: p.full_name as string,
        city: p.city as string | null,
        rec_count: recCountMap.get(targetId) ?? 0,
        mutual_friends: mutualFriends,
      } satisfies UserCard;
    })
    .filter((u): u is UserCard => u !== null)
    .sort((a, b) => b.mutual_friends.length - a.mutual_friends.length)
    .slice(0, 30);

  return (
    <CercaClient
      currentUserId={userId}
      myCity={myCity}
      sameCityUsers={sameCityUsers}
      friendsOfFriends={friendsOfFriends}
      followingIds={followingIds}
    />
  );
}
