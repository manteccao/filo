"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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
    redirect("/login?redirectTo=/users");
  }

  if (user.id === targetUserId) {
    redirect("/users");
  }

  await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: targetUserId,
  });

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
    redirect("/login?redirectTo=/users");
  }

  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);

  redirect("/users");
}

