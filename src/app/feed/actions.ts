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
