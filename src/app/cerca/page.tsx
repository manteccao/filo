import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { CercaClient, type UserProfile, type ProProfile } from "./CercaClient";

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
      supabase.from("profiles").select("city").eq("id", userId).single(),
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

  const followingIds = (follows ?? [])
    .map((f) => f.following_id as string)
    .filter(Boolean);

  const allProfiles = profilesData ?? [];

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

  return (
    <CercaClient
      myCity={myCity}
      sameCityUsers={sameCityUsers}
      sameCityPros={sameCityPros}
      followingIds={followingIds}
    />
  );
}
