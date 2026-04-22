"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const VALID_CATEGORIES = new Set([
  "dentista", "medico di base", "pediatra", "dermatologo", "oculista",
  "fisioterapista", "psicologo", "ginecologo", "ortopedico", "nutrizionista",
  "avvocato", "commercialista", "notaio", "consulente finanziario", "mediatore immobiliare",
  "idraulico", "elettricista", "muratore", "imbianchino", "falegname",
  "giardiniere", "fabbro", "caldaista", "geometra", "architetto",
  "meccanico", "carrozziere", "gommista", "informatico", "web designer",
  "fotografo", "videomaker", "babysitter", "doposcuola", "dog sitter",
  "veterinario", "parrucchiere", "estetista", "personal trainer", "tatuatore",
  "ristorante", "catering", "chef privato", "traslochi", "sartoria",
  "orologiaio", "ottico", "altro",
]);

export async function deleteRecommendation(id: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  await supabase
    .from("recommendations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/feed");
}

export async function toggleLike(recommendationId: string): Promise<{ liked: boolean } | { error: string }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Non autenticato" };

  const { data: existing } = await supabase
    .from("recommendation_likes")
    .select("id")
    .eq("recommendation_id", recommendationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("recommendation_likes")
      .delete()
      .eq("recommendation_id", recommendationId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
    return { liked: false };
  } else {
    // Rate limit: max 100 like al giorno
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: likesToday } = await supabase
      .from("recommendation_likes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since24h);
    if ((likesToday ?? 0) >= 100) {
      return { error: "Hai raggiunto il limite di 100 like al giorno." };
    }

    const { error } = await supabase
      .from("recommendation_likes")
      .insert({ recommendation_id: recommendationId, user_id: user.id });
    if (error) return { error: error.message };

    // Notifica al proprietario della raccomandazione
    const { data: rec } = await supabase
      .from("recommendations")
      .select("user_id")
      .eq("id", recommendationId)
      .single();
    if (rec && rec.user_id !== user.id) {
      await supabase.from("notifications").insert({
        user_id: rec.user_id,
        type: "like",
        actor_id: user.id,
        recommendation_id: recommendationId,
      });
    }

    return { liked: true };
  }
}

export async function toggleSave(recommendationId: string): Promise<{ saved: boolean } | { error: string }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Non autenticato" };

  const { data: existing } = await supabase
    .from("saves")
    .select("id")
    .eq("recommendation_id", recommendationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("saves")
      .delete()
      .eq("recommendation_id", recommendationId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
    return { saved: false };
  } else {
    const { error } = await supabase
      .from("saves")
      .insert({ recommendation_id: recommendationId, user_id: user.id });
    if (error) return { error: error.message };
    return { saved: true };
  }
}

export async function updateRecommendation(
  id: string,
  fields: { professional_name: string; category: string; city: string; note: string; address: string; price_range: string },
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  if (!fields.professional_name?.trim() || !fields.city?.trim()) return;
  if (!VALID_CATEGORIES.has(fields.category)) return;
  if (fields.note?.length > 300) return;

  await supabase
    .from("recommendations")
    .update(fields)
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/feed");
}
