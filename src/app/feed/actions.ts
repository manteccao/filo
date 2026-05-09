"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/onesignal";
import type { FeedItem, FeedRecommendation, FeedRequest } from "./types";

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
      const { data: actor } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      const actorName = (actor as { full_name?: string | null } | null)?.full_name ?? "Qualcuno";

      await supabase.from("notifications").insert({
        user_id: rec.user_id,
        type: "like",
        actor_id: user.id,
        recommendation_id: recommendationId,
      });

      sendPush(rec.user_id, `${actorName} ha messo mi piace alla tua raccomandazione`);
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

// ─── Cursor-based feed pagination ─────────────────────────────────────────────

export async function loadMoreFeedItems(cursor: string): Promise<{
  items: FeedItem[];
  hasMore: boolean;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { items: [], hasMore: false };

  const userId = user.id;

  const [{ data: recs }, { data: reqs }, { data: blockedData }] = await Promise.all([
    supabase
      .from("recommendations")
      .select("id,user_id,professional_name,category,city,note,address,price_range,created_at")
      .lt("created_at", cursor)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("requests_with_profile")
      .select("id,user_id,content,category,city,created_at,full_name")
      .lt("created_at", cursor)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("blocks").select("blocked_user_id").eq("user_id", userId),
  ]);

  const blockedUserIds = new Set((blockedData ?? []).map((b) => String(b.blocked_user_id)));
  const recommendations = (recs ?? []).filter((r) => !blockedUserIds.has(String(r.user_id)));
  const requests = (reqs ?? []).filter((r) => !blockedUserIds.has(String(r.user_id)));

  const isValidId = (v: unknown): v is string =>
    typeof v === "string" && v.length > 0 && v !== "null" && v !== "undefined";

  const recUserIds = recommendations.map((r) => r.user_id).filter(isValidId);
  const reqUserIds = requests.map((r) => r.user_id).filter(isValidId);
  const allProfileIds = Array.from(new Set([...recUserIds, ...reqUserIds]));
  const recIds = recommendations.map((r) => r.id);

  const [profilesResult, { data: myLikes }, { data: allLikes }, { data: mySaves }] =
    await Promise.all([
      allProfileIds.length
        ? supabase.from("profiles").select("id,full_name,city,username,account_type").in("id", allProfileIds)
        : Promise.resolve({ data: [], error: null }),
      recIds.length
        ? supabase.from("recommendation_likes").select("recommendation_id").eq("user_id", userId).in("recommendation_id", recIds)
        : Promise.resolve({ data: [] }),
      recIds.length
        ? supabase.from("recommendation_likes").select("recommendation_id").in("recommendation_id", recIds)
        : Promise.resolve({ data: [] }),
      recIds.length
        ? supabase.from("saves").select("recommendation_id").eq("user_id", userId).in("recommendation_id", recIds)
        : Promise.resolve({ data: [] }),
    ]);

  const profiles = profilesResult.data ?? [];
  const profileById = new Map(
    profiles.map((p) => [
      String(p.id),
      {
        full_name: p.full_name as string | null,
        city: p.city as string | null,
        username: p.username as string | null,
        avatar_url: null as null,
        account_type: (p as { account_type?: string | null }).account_type ?? "user",
      },
    ])
  );

  const likedByMe = new Set((myLikes ?? []).map((l) => l.recommendation_id));
  const savedByMe = new Set((mySaves ?? []).map((s) => s.recommendation_id));
  const likesPerRec = new Map<string, number>();
  for (const l of allLikes ?? []) {
    likesPerRec.set(l.recommendation_id, (likesPerRec.get(l.recommendation_id) ?? 0) + 1);
  }

  const recItems: FeedRecommendation[] = recommendations
    .filter((r) => isValidId(r.user_id))
    .map((r) => {
      const uid = r.user_id as string;
      const prof = profileById.get(uid) ?? null;
      return {
        type: "recommendation" as const,
        id: r.id as string,
        user_id: uid,
        professional_name: r.professional_name as string,
        category: r.category as string,
        city: r.city as string,
        note: r.note as string | null,
        address: r.address as string | null,
        price_range: r.price_range as string | null,
        created_at: r.created_at as string,
        likes_count: likesPerRec.get(r.id as string) ?? 0,
        liked_by_me: likedByMe.has(r.id as string),
        saved_by_me: savedByMe.has(r.id as string),
        profile: prof,
      };
    });

  const reqItems: FeedRequest[] = requests.map((r) => ({
    type: "request" as const,
    id: r.id as string,
    user_id: String(r.user_id),
    content: r.content as string,
    category: r.category as string,
    city: r.city as string,
    created_at: r.created_at as string,
    profile: { full_name: (r as { full_name?: string | null }).full_name ?? null },
  }));

  const items: FeedItem[] = [...recItems, ...reqItems].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const hasMore = (recs?.length ?? 0) >= 20 || (reqs?.length ?? 0) >= 20;

  return { items, hasMore };
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
