"use server";

import { createClient } from "@/lib/supabase/server";

const VALID_REASONS = new Set([
  "spam",
  "contenuto_inappropriato",
  "informazioni_false",
]);

export async function blockUser(
  targetUserId: string,
): Promise<{ ok: boolean } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Non autenticato" };
  if (targetUserId === user.id) return { error: "Non puoi bloccare te stesso" };

  const { error } = await supabase.from("blocks").upsert(
    { user_id: user.id, blocked_user_id: targetUserId },
    { onConflict: "user_id,blocked_user_id" },
  );
  if (error) return { error: error.message };
  return { ok: true };
}

export async function unblockUser(
  targetUserId: string,
): Promise<{ ok: boolean } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Non autenticato" };

  await supabase
    .from("blocks")
    .delete()
    .eq("user_id", user.id)
    .eq("blocked_user_id", targetUserId);
  return { ok: true };
}

export async function reportContent(
  targetId: string,
  type: "recommendation" | "user",
  reason: string,
): Promise<{ ok: boolean } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Non autenticato" };
  if (!VALID_REASONS.has(reason)) return { error: "Motivo non valido" };

  // Rate limit: max 20 segnalazioni al giorno
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: reportsToday } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since24h);
  if ((reportsToday ?? 0) >= 20) {
    return { error: "Hai raggiunto il limite di 20 segnalazioni al giorno." };
  }

  if (type === "recommendation") {
    const { error } = await supabase
      .from("reports")
      .insert({ user_id: user.id, recommendation_id: targetId, reason });
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("reports")
      .insert({ user_id: user.id, reported_user_id: targetId, reason });
    if (error) return { error: error.message };
  }
  return { ok: true };
}
