import { redirect } from "next/navigation";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { CercaClient, type UserCard, type ProCard, type ProRecommender } from "./CercaClient";

function normalizeCity(city: string | null | undefined): string {
  return city?.toLowerCase().trim() ?? "";
}

type ProfileRow = {
  id: string;
  full_name: string | null;
  city: string | null;
  username: string | null;
  avatar_url: string | null;
};

type RecRow = {
  user_id: string;
  professional_name: string;
  category: string;
  city: string | null;
  price_range: string | null;
};

function buildProCards(
  proMap: Map<string, RecRow[]>,
  profileById: Map<string, ProfileRow>,
  getMutualFriend: (uid: string) => string | undefined,
  max: number,
): ProCard[] {
  const cards: ProCard[] = [];
  for (const [, recs] of proMap) {
    const first = recs[0];
    if (!first?.professional_name) continue;
    const recommenders: ProRecommender[] = [];
    const seen = new Set<string>();
    for (const r of recs) {
      const uid = r.user_id;
      if (seen.has(uid)) continue;
      seen.add(uid);
      const p = profileById.get(uid);
      if (!p?.full_name) continue;
      recommenders.push({
        id: uid,
        full_name: p.full_name,
        username: p.username ?? null,
        avatar_url: p.avatar_url ?? null,
        mutual_friend: getMutualFriend(uid),
      });
      if (recommenders.length >= 3) break;
    }
    if (recommenders.length === 0) continue;
    cards.push({
      slug: first.professional_name.trim().replace(/\s+/g, "-"),
      professional_name: first.professional_name,
      category: first.category ?? "",
      city: first.city ?? null,
      rec_count: recs.length,
      price_range: first.price_range ?? null,
      recommenders,
    });
  }
  return cards.sort((a, b) => b.rec_count - a.rec_count).slice(0, max);
}

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
    (myProfileData as { city?: string | null } | null)?.city?.trim() ?? null;
  const myCityNorm = normalizeCity(myCity);

  const followingIds = (follows ?? [])
    .map((f) => f.following_id as string)
    .filter(Boolean);
  const blockedIds = new Set(
    (blockedData ?? []).map((b) => b.blocked_user_id as string).filter(Boolean),
  );
  const excludedIds = new Set([userId, ...followingIds, ...blockedIds]);

  const adminClient = createAdminClient();

  // ── Parallel: all profiles + second-degree follows ───────────────────────
  const [allProfilesResult, secondDegreeResult] = await Promise.all([
    adminClient.from("profiles").select("id,full_name,city,username,avatar_url"),
    followingIds.length > 0
      ? supabase
          .from("follows")
          .select("follower_id,following_id")
          .in("follower_id", followingIds)
      : Promise.resolve({
          data: [] as { follower_id: string; following_id: string }[],
        }),
  ]);

  // Build profile lookup map
  const profileById = new Map<string, ProfileRow>(
    (allProfilesResult.data ?? []).map((p) => [p.id as string, p as ProfileRow]),
  );

  // Following names for "amico di X" labels
  const followingNameById = new Map<string, string>(
    followingIds
      .map((id) => {
        const name = profileById.get(id)?.full_name ?? null;
        return name ? ([id, name] as [string, string]) : null;
      })
      .filter((e): e is [string, string] => e !== null),
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
  const fofSet = new Set(fofIds);

  // ── Rec counts for user cards ───────────────────────────────────────────
  const relevantIds = Array.from(
    new Set([
      ...(allProfilesResult.data ?? [])
        .map((p) => p.id as string)
        .filter((id) => !excludedIds.has(id) && myCityNorm
          ? normalizeCity(profileById.get(id)?.city) === myCityNorm
          : false),
      ...fofIds,
    ]),
  );

  // ── Same-city all users (including following) for pro cards ──────────────
  const sameCityAllIds = myCityNorm
    ? (allProfilesResult.data ?? [])
        .filter(
          (p) =>
            p.id !== userId &&
            !blockedIds.has(p.id as string) &&
            normalizeCity(p.city as string | null) === myCityNorm,
        )
        .map((p) => p.id as string)
    : [];
  const sameCityAllSet = new Set(sameCityAllIds);

  const proQueryIds = Array.from(new Set([...sameCityAllIds, ...fofIds]));

  // ── Parallel: user rec counts + pro recs ─────────────────────────────────
  const [recRowsResult, proRecRowsResult] = await Promise.all([
    relevantIds.length > 0
      ? supabase
          .from("recommendations")
          .select("user_id")
          .in("user_id", relevantIds)
      : Promise.resolve({ data: [] as { user_id: string }[] }),
    proQueryIds.length > 0
      ? supabase
          .from("recommendations")
          .select("user_id,professional_name,category,city,price_range")
          .in("user_id", proQueryIds)
      : Promise.resolve({ data: [] as RecRow[] }),
  ]);

  const recCountMap = new Map<string, number>();
  for (const r of recRowsResult.data ?? []) {
    const uid = r.user_id as string;
    recCountMap.set(uid, (recCountMap.get(uid) ?? 0) + 1);
  }

  // ── Section 1: same city users ────────────────────────────────────────────
  const sameCityUsers: UserCard[] = myCityNorm
    ? (allProfilesResult.data ?? [])
        .filter((p) => {
          if (excludedIds.has(p.id as string)) return false;
          if (!p.full_name) return false;
          return normalizeCity(p.city as string | null) === myCityNorm;
        })
        .map((p) => ({
          id: p.id as string,
          full_name: p.full_name as string,
          city: p.city as string | null,
          rec_count: recCountMap.get(p.id as string) ?? 0,
          mutual_friends: [],
        }))
        .slice(0, 20)
    : [];

  // ── Section 2: friends of friends ─────────────────────────────────────────
  const friendsOfFriends: UserCard[] = fofIds
    .map((targetId) => {
      const p = profileById.get(targetId);
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

  // ── Pro cards: group recs by professional_name ────────────────────────────
  const sameCityProMap = new Map<string, RecRow[]>();
  const fofProMap = new Map<string, RecRow[]>();

  for (const rec of proRecRowsResult.data ?? []) {
    const uid = rec.user_id as string;
    if (!rec.professional_name) continue;
    const key = (rec.professional_name as string).toLowerCase().trim();

    if (sameCityAllSet.has(uid)) {
      if (!sameCityProMap.has(key)) sameCityProMap.set(key, []);
      sameCityProMap.get(key)!.push(rec as RecRow);
    }
    if (fofSet.has(uid)) {
      if (!fofProMap.has(key)) fofProMap.set(key, []);
      fofProMap.get(key)!.push(rec as RecRow);
    }
  }

  const sameCityPros = buildProCards(
    sameCityProMap,
    profileById,
    () => undefined,
    30,
  );

  const fofPros = buildProCards(
    fofProMap,
    profileById,
    (uid) => {
      const viaIds = Array.from(fofMap.get(uid) ?? []);
      const viaName = viaIds.map((id) => followingNameById.get(id)).find(Boolean);
      return viaName ?? undefined;
    },
    30,
  );

  return (
    <CercaClient
      currentUserId={userId}
      myCity={myCity}
      sameCityUsers={sameCityUsers}
      friendsOfFriends={friendsOfFriends}
      followingIds={followingIds}
      sameCityPros={sameCityPros}
      fofPros={fofPros}
    />
  );
}
