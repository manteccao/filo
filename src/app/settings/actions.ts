"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function deleteAccount(): Promise<{ ok: boolean } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Non autenticato" };

  const uid = user.id;

  // 1. Delete leaf rows first (no FK dependencies on them)
  await Promise.all([
    supabase.from("recommendation_likes").delete().eq("user_id", uid),
    supabase.from("saves").delete().eq("user_id", uid),
    supabase.from("notifications").delete().eq("user_id", uid),
    supabase.from("notifications").delete().eq("actor_id", uid),
    supabase.from("blocks").delete().eq("user_id", uid),
    supabase.from("blocks").delete().eq("blocked_user_id", uid),
    supabase.from("reports").delete().eq("user_id", uid),
  ]);

  // 2. Delete replies and comments (depend on recommendations / requests)
  await Promise.all([
    supabase.from("request_replies").delete().eq("user_id", uid),
    supabase.from("comments").delete().eq("user_id", uid),
    supabase.from("follows").delete().eq("follower_id", uid),
    supabase.from("follows").delete().eq("following_id", uid),
  ]);

  // 3. Delete top-level content
  await Promise.all([
    supabase.from("recommendations").delete().eq("user_id", uid),
    supabase.from("requests").delete().eq("user_id", uid),
  ]);

  // 4. Delete profile
  await supabase.from("profiles").delete().eq("id", uid);

  // 5. Delete auth user (requires service role key)
  const admin = createAdminClient();
  const { error: deleteError } = await admin.auth.admin.deleteUser(uid);
  if (deleteError) return { error: deleteError.message };

  return { ok: true };
}
