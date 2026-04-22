import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { CercaClient } from "./CercaClient";

export default async function CercaPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const userId = user.id;

  const [{ data: myProfileData }, { data: follows }] = await Promise.all([
    supabase.from("profiles").select("city").eq("id", userId).single(),
    supabase.from("follows").select("following_id").eq("follower_id", userId),
  ]);

  const myCity =
    (myProfileData as { city?: string | null } | null)?.city?.trim() ?? null;

  const followingIds = (follows ?? [])
    .map((f) => f.following_id as string)
    .filter(Boolean);

  console.log("[cerca] userId:", userId, "myCity:", myCity, "following:", followingIds.length);

  return (
    <CercaClient
      userId={userId}
      myCity={myCity}
      followingIds={followingIds}
    />
  );
}
