"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/onesignal";

export async function followUser(formData: FormData) {
  const targetUserId = String(formData.get("targetUserId") ?? "");
  if (!targetUserId) {
    redirect("/users");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  if (user.id === targetUserId) {
    redirect("/users");
  }

  await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: targetUserId,
  });

  await supabase.from("notifications").insert({
    user_id: targetUserId,
    type: "follow",
    actor_id: user.id,
  });

  const { data: actor } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const actorName = (actor as { full_name?: string | null } | null)?.full_name ?? "Qualcuno";
  sendPush(targetUserId, `${actorName} ha iniziato a seguirti`, "https://filo.network/profile");

  redirect("/users");
}

export async function unfollowUser(formData: FormData) {
  const targetUserId = String(formData.get("targetUserId") ?? "");
  if (!targetUserId) {
    redirect("/users");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);

  redirect("/users");
}

