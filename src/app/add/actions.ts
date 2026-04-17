"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const CATEGORIES = [
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
] as const;

export async function addRecommendation(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const professionalName = String(formData.get("professionalName") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const priceRange = String(formData.get("priceRange") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const professionalId = String(formData.get("professionalId") ?? "").trim() || null;

  if (!professionalName || !categoryRaw || !city) {
    return { error: "Compila tutti i campi obbligatori." };
  }
  if (note.length > 300) {
    return { error: "La nota personale può essere lunga al massimo 300 caratteri." };
  }
  if (!CATEGORIES.includes(categoryRaw as (typeof CATEGORIES)[number])) {
    return { error: "Categoria non valida." };
  }

  const supabase = await createClient();
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) redirect("/login?redirectTo=/add");

  if (!data.user.email_confirmed_at && !data.user.app_metadata?.provider) {
    return { error: "Verifica la tua email prima di pubblicare raccomandazioni." };
  }

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("account_type, full_name")
    .eq("id", data.user.id)
    .single();

  if ((myProfile as { account_type?: string } | null)?.account_type === "professional") {
    const myName = ((myProfile as { full_name?: string | null } | null)?.full_name ?? "").toLowerCase().trim();
    if (myName && professionalName.toLowerCase().trim() === myName) {
      return { error: "Non puoi raccomandare te stesso." };
    }
  }

  // Validate professional_id if provided
  if (professionalId) {
    if (professionalId === data.user.id) {
      return { error: "Non puoi raccomandare te stesso." };
    }
  }

  const { error } = await supabase.from("recommendations").insert({
    user_id: data.user.id,
    professional_name: professionalName,
    category: categoryRaw,
    city,
    note,
    address: address || null,
    price_range: priceRange || null,
    phone: phone || null,
    professional_id: professionalId,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Hai già raccomandato questo professionista in questa città." };
    }
    return { error: error.message };
  }

  redirect("/feed");
}
