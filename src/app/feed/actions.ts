"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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
    const { error } = await supabase
      .from("recommendation_likes")
      .insert({ recommendation_id: recommendationId, user_id: user.id });
    if (error) return { error: error.message };
    return { liked: true };
  }
}

export async function updateRecommendation(
  id: string,
  fields: { professional_name: string; category: string; city: string; note: string; address: string; price_range: string },
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  await supabase
    .from("recommendations")
    .update(fields)
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/feed");
}
