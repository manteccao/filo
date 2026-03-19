import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { FeedClient, type FeedRecommendation } from "./FeedClient";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?redirectTo=/feed");
  }

  const { data: recs, error: recsError } = await supabase
    .from("recommendations")
    .select("id,user_id,professional_name,category,city,note,created_at")
    .order("created_at", { ascending: false });

  if (recsError) {
    redirect(`/feed?error=${encodeURIComponent(recsError.message)}`);
  }

  const recommendations = recs ?? [];
  const userIds = Array.from(new Set(recommendations.map((r) => r.user_id)));

  const [{ data: profiles, error: profilesError }, { data: follows }] =
    await Promise.all([
      userIds.length
        ? supabase
            .from("profiles")
            .select("id,full_name,city")
            .in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", data.user.id),
    ]);

  if (profilesError) {
    redirect(`/feed?error=${encodeURIComponent(profilesError.message)}`);
  }

  const profileById = new Map(
    (profiles ?? []).map((p) => [p.id, { full_name: p.full_name, city: p.city }]),
  );

  const followingIds = (follows ?? []).map((f) => f.following_id as string);

  const { data: secondDegreeFollows } = followingIds.length
    ? await supabase
        .from("follows")
        .select("following_id")
        .in("follower_id", followingIds)
    : Promise.resolve({ data: [] });

  const secondDegreeIds = Array.from(
    new Set(
      (secondDegreeFollows ?? [])
        .map((f) => f.following_id as string)
        .filter((id) => id !== data.user.id && !followingIds.includes(id)),
    ),
  );

  const merged: FeedRecommendation[] = recommendations.map((r) => ({
    ...r,
    profile: profileById.get(r.user_id) ?? null,
  }));

  return (
    <FeedClient
      recommendations={merged}
      followingIds={followingIds}
      secondDegreeIds={secondDegreeIds}
    />
  );
}
