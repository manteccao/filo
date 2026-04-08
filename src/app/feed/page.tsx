import { redirect } from "next/navigation";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { FeedClient, type FeedItem, type FeedRecommendation, type FeedRequest, type FollowingProfile } from "./FeedClient";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?redirectTo=/feed");
  }

  const userId = data.user.id;

  // Fetch recommendations, requests, follows, and blocked users in parallel
  const [{ data: recs }, { data: reqs }, { data: follows }, { data: blockedData }] =
    await Promise.all([
      supabase
        .from("recommendations")
        .select("id,user_id,professional_name,category,city,note,address,price_range,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("requests_with_profile")
        .select("id,user_id,content,category,city,created_at,full_name"),
      supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId),
      supabase
        .from("blocks")
        .select("blocked_user_id")
        .eq("user_id", userId),
    ]);

  const blockedUserIds = new Set((blockedData ?? []).map((b) => String(b.blocked_user_id)));

  const recommendations = recs ?? [];
  const requests = reqs ?? [];
  const followingIds = (follows ?? []).map((f) => String(f.following_id));

  // Collect all user_ids that need profiles — filter out nulls before building the set
  const isValidId = (v: unknown): v is string =>
    typeof v === "string" && v.length > 0 && v !== "null" && v !== "undefined";
  const recUserIds = recommendations.map((r) => r.user_id).filter(isValidId);
  const reqUserIds = requests.map((r) => r.user_id).filter(isValidId);
  const allProfileIds = Array.from(new Set([...recUserIds, ...reqUserIds, ...followingIds]));

  const recIds = recommendations.map((r) => r.id);

  // Fetch profiles con admin client (bypassa RLS) per leggere profili altrui
  const adminClient = createAdminClient();
  const profilesResult = allProfileIds.length
    ? await adminClient.from("profiles").select("id,full_name,city,username").in("id", allProfileIds)
    : { data: [], error: null };
  const [
    { data: secondDegreeFollows },
    { data: myLikes },
    { data: allLikes },
    { data: mySaves },
  ] = await Promise.all([
    followingIds.length
      ? supabase.from("follows").select("following_id").in("follower_id", followingIds)
      : Promise.resolve({ data: [] }),
    recIds.length
      ? supabase.from("recommendation_likes").select("recommendation_id").eq("user_id", userId).in("recommendation_id", recIds)
      : Promise.resolve({ data: [] }),
    recIds.length
      ? supabase.from("recommendation_likes").select("recommendation_id").in("recommendation_id", recIds)
      : Promise.resolve({ data: [] }),
    recIds.length
      ? supabase.from("saves").select("recommendation_id").eq("user_id", userId).in("recommendation_id", recIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profiles = profilesResult.data ?? [];

  const profileById = new Map(
    profiles.map((p) => [
      String(p.id),
      {
        full_name: p.full_name as string | null,
        city: p.city as string | null,
        username: p.username as string | null,
        avatar_url: null,
      },
    ])
  );

  const secondDegreeIds = Array.from(
    new Set(
      (secondDegreeFollows ?? [])
        .map((f) => String(f.following_id))
        .filter((id) => id !== userId && !followingIds.includes(id))
    )
  );

  const likedByMe = new Set((myLikes ?? []).map((l) => l.recommendation_id));
  const savedByMe = new Set((mySaves ?? []).map((s) => s.recommendation_id));
  const likesPerRec = new Map<string, number>();
  for (const l of allLikes ?? []) {
    likesPerRec.set(l.recommendation_id, (likesPerRec.get(l.recommendation_id) ?? 0) + 1);
  }

  // Build typed arrays — exclude content from blocked users
  const recItems: FeedRecommendation[] = recommendations.filter((r) => isValidId(r.user_id) && !blockedUserIds.has(r.user_id as string)).map((r) => {
    const uid = r.user_id as string;
    const prof = profileById.get(uid) ?? null;
    return {
      type: "recommendation" as const,
      id: r.id,
      user_id: uid,
      professional_name: r.professional_name,
      category: r.category,
      city: r.city,
      note: r.note as string | null,
      address: r.address as string | null,
      price_range: r.price_range as string | null,
      created_at: r.created_at,
      likes_count: likesPerRec.get(r.id) ?? 0,
      liked_by_me: likedByMe.has(r.id),
      saved_by_me: savedByMe.has(r.id),
      profile: prof ? { full_name: prof.full_name, city: prof.city, username: prof.username, avatar_url: prof.avatar_url } : null,
    };
  });

  const reqItems: FeedRequest[] = requests.filter((r) => !blockedUserIds.has(String(r.user_id))).map((r) => ({
    type: "request" as const,
    id: r.id,
    user_id: String(r.user_id),
    content: r.content,
    category: r.category,
    city: r.city,
    created_at: r.created_at,
    profile: { full_name: (r as { full_name?: string | null }).full_name ?? null },
  }));

  const items: FeedItem[] = [...recItems, ...reqItems].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const followingProfiles: FollowingProfile[] = followingIds
    .map((id) => {
      const p = profileById.get(id);
      return {
        id,
        full_name: p?.full_name ?? null,
        username: p?.username ?? null,
        avatar_url: p?.avatar_url ?? null,
      };
    })
    .filter((p) => p.full_name !== null);

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  return (
    <FeedClient
      items={items}
      followingIds={followingIds}
      secondDegreeIds={secondDegreeIds}
      currentUserId={userId}
      followingProfiles={followingProfiles}
      initialUnreadCount={unreadCount ?? 0}
    />
  );
}
