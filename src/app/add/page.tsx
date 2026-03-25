import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";

const CATEGORIES = [
  "dentista", "medico", "avvocato", "commercialista",
  "idraulico", "elettricista", "altro",
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
  if (userError || !data.user) redirect("/login?redirectTo=/add");

  const { error } = await supabase.from("recommendations").insert({
    user_id: data.user.id,
    professional_name: professionalName,
    category: categoryRaw,
    city,
    note,
    address: address || null,
    price_range: priceRange || null,
  });

  if (error) errorRedirect(error.message);
  redirect("/feed");
}

export default async function AddRecommendationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) redirect("/login?redirectTo=/add");

  const { error } = await searchParams;

  const inputCls = "h-12 w-full rounded-2xl border border-[#232340] bg-[#16162a] px-4 text-sm text-white placeholder:text-[#5c5f7a] outline-none transition focus:border-[#0D9488]";
  const labelCls = "text-[11px] font-semibold uppercase tracking-widest text-[#5c5f7a]";

  return (
    <div className="min-h-svh bg-[#0d0d17] text-white">
      <header className="sticky top-0 z-40 bg-[#0d0d17]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[430px] items-center justify-center px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/filo-logo-3d.png" alt="Filo" className="h-9 w-auto object-contain" style={{ mixBlendMode: "screen" }} />
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-28 pt-4">
        <h1 className="text-xl font-bold tracking-tight">Nuova raccomandazione</h1>
        <p className="mt-1 text-sm text-[#8b8fa8]">
          Consiglia un professionista di fiducia con una nota personale.
        </p>

        <form action={addRecommendation} className="mt-6 space-y-4">
          {error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label className={labelCls} htmlFor="professionalName">Nome del professionista</label>
            <input id="professionalName" name="professionalName" type="text" required placeholder="Es. Dott. Luca Bianchi" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelCls} htmlFor="category">Categoria</label>
              <select id="category" name="category" required defaultValue="" className={inputCls}>
                <option value="" disabled className="bg-[#16162a]">Seleziona…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#16162a]">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls} htmlFor="city">Città</label>
              <input id="city" name="city" type="text" required placeholder="Es. Milano" className={inputCls} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls} htmlFor="address">
              Indirizzo <span className="normal-case font-normal text-[#5c5f7a]">(opzionale)</span>
            </label>
            <input id="address" name="address" type="text" placeholder="Es. Via Roma 15, centro" className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <label className={labelCls} htmlFor="priceRange">
              Fascia di prezzo <span className="normal-case font-normal text-[#5c5f7a]">(opzionale)</span>
            </label>
            <select id="priceRange" name="priceRange" defaultValue="" className={inputCls}>
              <option value="" className="bg-[#16162a]">Seleziona…</option>
              <option value="€" className="bg-[#16162a]">€ — Economico</option>
              <option value="€€" className="bg-[#16162a]">€€ — Nella media</option>
              <option value="€€€" className="bg-[#16162a]">€€€ — Premium</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelCls} htmlFor="note">Nota personale</label>
              <span className="text-[11px] text-[#5c5f7a]">max 300</span>
            </div>
            <textarea
              id="note"
              name="note"
              maxLength={300}
              rows={4}
              placeholder="Perché lo/la consigli? Cosa ti ha colpito?"
              className="w-full resize-none rounded-2xl border border-[#232340] bg-[#16162a] px-4 py-3 text-sm text-white placeholder:text-[#5c5f7a] outline-none transition focus:border-[#0D9488]"
            />
          </div>

          <button
            type="submit"
            className="mt-2 h-12 w-full rounded-2xl bg-[#0D9488] text-sm font-semibold text-white shadow-[0_0_24px_rgba(13,148,136,0.35)] transition hover:bg-[#0b7c76] active:scale-[0.98]"
          >
            Salva raccomandazione
          </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
