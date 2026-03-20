import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { FeedClient, type FeedItem, type FeedRecommendation, type FeedRequest } from "./FeedClient";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?redirectTo=/feed");
  }

  // Fetch recommendations and requests in parallel
  const [{ data: recs, error: recsError }, { data: reqs }, { data: follows }] =
    await Promise.all([
      supabase
        .from("recommendations")
        .select("id,user_id,professional_name,category,city,note,address,price_range,created_at"),
      supabase
        .from("requests_with_profile")
        .select("id,user_id,content,category,city,created_at,full_name"),
      supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", data.user.id),
    ]);

  if (recsError) {
    redirect(`/feed?error=${encodeURIComponent(recsError.message)}`);
  }

  const recommendations = recs ?? [];
  const requests = reqs ?? [];

  // Collect all unique user_ids to fetch profiles
  const allUserIds = Array.from(
    new Set([
      ...recommendations.map((r) => r.user_id),
      ...requests.map((r) => r.user_id),
    ])
  );

  const { data: profiles } = await (allUserIds.length
    ? supabase.from("profiles").select("id,full_name,city").in("id", allUserIds)
    : Promise.resolve({ data: [] }));

  const profileById = new Map(
    (profiles ?? []).map((p) => [p.id, { full_name: p.full_name, city: p.city }])
  );

  const followingIds = (follows ?? []).map((f) => f.following_id as string);

  const { data: secondDegreeFollows } = await (followingIds.length
    ? supabase
        .from("follows")
        .select("following_id")
        .in("follower_id", followingIds)
    : Promise.resolve({ data: [] }));

  const secondDegreeIds = Array.from(
    new Set(
      (secondDegreeFollows ?? [])
        .map((f) => f.following_id as string)
        .filter((id) => id !== data.user.id && !followingIds.includes(id))
    )
  );

  // Build typed arrays
  const recItems: FeedRecommendation[] = recommendations.map((r) => ({
    type: "recommendation" as const,
    ...r,
    profile: profileById.get(r.user_id) ?? null,
  }));

  const reqItems: FeedRequest[] = requests.map((r) => ({
    type: "request" as const,
    id: r.id,
    user_id: r.user_id,
    content: r.content,
    category: r.category,
    city: r.city,
    created_at: r.created_at,
    profile: { full_name: (r as { full_name?: string | null }).full_name ?? null },
  }));

  // Merge and sort chronologically (newest first)
  const items: FeedItem[] = [...recItems, ...reqItems].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <FeedClient
      items={items}
      followingIds={followingIds}
      secondDegreeIds={secondDegreeIds}
      currentUserId={data.user.id}
    />
  );
}
