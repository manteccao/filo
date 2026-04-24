"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function deleteAccount(): Promise<{ ok: boolean } | { error: string }> {
  // Verify the caller is authenticated
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Non autenticato" };

  const uid = user.id;

  // Use admin client for all deletions — bypasses RLS so nothing is left behind
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Configurazione server non valida. Contatta il supporto." };
  }

  // 1. Delete leaf rows first (no FK dependencies on them)
  await Promise.all([
    admin.from("recommendation_likes").delete().eq("user_id", uid),
    admin.from("saves").delete().eq("user_id", uid),
    admin.from("notifications").delete().eq("user_id", uid),
    admin.from("notifications").delete().eq("actor_id", uid),
    admin.from("blocks").delete().eq("user_id", uid),
    admin.from("blocks").delete().eq("blocked_user_id", uid),
    admin.from("reports").delete().eq("user_id", uid),
  ]);

  // 2. Delete replies, comments, follows (depend on recommendations / requests / profiles)
  await Promise.all([
    admin.from("request_replies").delete().eq("user_id", uid),
    admin.from("comments").delete().eq("user_id", uid),
    admin.from("follows").delete().eq("follower_id", uid),
    admin.from("follows").delete().eq("following_id", uid),
  ]);

  // 3. Delete top-level content
  await Promise.all([
    admin.from("recommendations").delete().eq("user_id", uid),
    admin.from("requests").delete().eq("user_id", uid),
  ]);

  // 4. Delete profile row
  await admin.from("profiles").delete().eq("id", uid);

  // 5. Delete auth user — this is the step that prevents re-login
  try {
    const { error: deleteError } = await admin.auth.admin.deleteUser(uid);
    if (deleteError) return { error: deleteError.message };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Errore durante la cancellazione dell'account." };
  }

  return { ok: true };
}
