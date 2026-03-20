import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";

const CATEGORIES = [
  "dentista",
  "medico",
  "avvocato",
  "commercialista",
  "idraulico",
  "elettricista",
  "altro",
] as const;

function errorRedirect(message: string) {
  const url = new URL("/add", "http://localhost");
  url.searchParams.set("error", message);
  redirect(`${url.pathname}?${url.searchParams.toString()}`);
}

async function addRecommendation(formData: FormData) {
  "use server";

  const professionalName = String(formData.get("professionalName") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const priceRange = String(formData.get("priceRange") ?? "").trim();

  if (!professionalName || !categoryRaw || !city) {
    errorRedirect("Compila tutti i campi obbligatori.");
  }

  if (note.length > 300) {
    errorRedirect("La nota personale può essere lunga al massimo 300 caratteri.");
  }

  if (!CATEGORIES.includes(categoryRaw as (typeof CATEGORIES)[number])) {
    errorRedirect("Categoria non valida.");
  }

  const supabase = await createClient();
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    redirect("/login?redirectTo=/add");
  }

  const { error } = await supabase.from("recommendations").insert({
    user_id: data.user.id,
    professional_name: professionalName,
    category: categoryRaw,
    city,
    note,
    address: address || null,
    price_range: priceRange || null,
  });

  if (error) {
    errorRedirect(error.message);
  }

  redirect("/feed");
}

export default async function AddRecommendationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    redirect("/login?redirectTo=/add");
  }

  const { error } = await searchParams;

  return (
    <div className="min-h-svh bg-[#0a0a0a] text-white">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-[#222222] bg-[#0a0a0a]">
        <div className="mx-auto flex h-12 max-w-[430px] items-center justify-center px-4">
          <span className="text-base font-bold tracking-tight text-white">Filo</span>
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-24 pt-6">
        <h1 className="text-xl font-bold tracking-tight">
          Nuova raccomandazione
        </h1>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Consiglia un professionista di fiducia con una nota personale.
        </p>

        <form action={addRecommendation} className="mt-6 space-y-4">
          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]" htmlFor="professionalName">
              Nome del professionista
            </label>
            <input
              id="professionalName"
              name="professionalName"
              type="text"
              required
              placeholder="Es. Dott. Luca Bianchi"
              className="h-12 w-full rounded-2xl border border-[#222222] bg-[#111111] px-4 text-sm text-white placeholder:text-[#6B7280] outline-none transition focus:border-[#8B5CF6]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]" htmlFor="category">
              Categoria
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue=""
              className="h-12 w-full rounded-2xl border border-[#222222] bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-[#8B5CF6]"
            >
              <option value="" disabled className="bg-[#111111]">
                Seleziona…
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#111111]">
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]" htmlFor="city">
              Città
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              placeholder="Es. Milano"
              className="h-12 w-full rounded-2xl border border-[#222222] bg-[#111111] px-4 text-sm text-white placeholder:text-[#6B7280] outline-none transition focus:border-[#8B5CF6]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]" htmlFor="address">
              Indirizzo o zona <span className="normal-case text-[#6B7280]">(opzionale)</span>
            </label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="Es. Via Roma 15, Torino centro"
              className="h-12 w-full rounded-2xl border border-[#222222] bg-[#111111] px-4 text-sm text-white placeholder:text-[#6B7280] outline-none transition focus:border-teal-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]" htmlFor="priceRange">
              Fascia di prezzo <span className="normal-case text-[#6B7280]">(opzionale)</span>
            </label>
            <select
              id="priceRange"
              name="priceRange"
              defaultValue=""
              className="h-12 w-full rounded-2xl border border-[#222222] bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-teal-600"
            >
              <option value="" className="bg-[#111111]">Seleziona…</option>
              <option value="€" className="bg-[#111111]">€ — Economico</option>
              <option value="€€" className="bg-[#111111]">€€ — Nella media</option>
              <option value="€€€" className="bg-[#111111]">€€€ — Premium</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]" htmlFor="note">
                Nota personale
              </label>
              <span className="text-xs text-[#6B7280]">Max 300 caratteri</span>
            </div>
            <textarea
              id="note"
              name="note"
              maxLength={300}
              rows={5}
              placeholder="Perché lo/la consigli? Cosa ti ha colpito?"
              className="w-full resize-none rounded-2xl border border-[#222222] bg-[#111111] px-4 py-3 text-sm text-white placeholder:text-[#6B7280] outline-none transition focus:border-[#8B5CF6]"
            />
          </div>

          <button
            type="submit"
            className="mt-2 h-12 w-full rounded-2xl bg-[#8B5CF6] text-sm font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.35)] transition hover:bg-[#7C3AED] active:scale-[0.98]"
          >
            Salva raccomandazione
          </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
