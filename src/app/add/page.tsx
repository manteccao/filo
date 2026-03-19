import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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
    <div className="flex flex-1 items-center justify-center bg-black px-6 py-16 text-zinc-50">
      <div className="w-full max-w-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
        >
          <span className="h-2 w-2 rounded-full bg-zinc-700" />
          Torna alla home
        </Link>

        <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950/60 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur">
          <h1 className="text-2xl font-semibold tracking-tight">
            Aggiungi una raccomandazione
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Consiglia un professionista di fiducia con una nota personale.
          </p>

          <form action={addRecommendation} className="mt-6 space-y-4">
            {error ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <label
                className="text-sm text-zinc-300"
                htmlFor="professionalName"
              >
                Nome del professionista
              </label>
              <input
                id="professionalName"
                name="professionalName"
                type="text"
                required
                placeholder="Es. Dott. Luca Bianchi"
                className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none transition focus:border-white/20 focus:bg-zinc-900"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-zinc-300" htmlFor="category">
                  Categoria
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  defaultValue=""
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 text-sm text-zinc-50 outline-none transition focus:border-white/20 focus:bg-zinc-900"
                >
                  <option value="" disabled className="bg-zinc-950">
                    Seleziona…
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-zinc-950">
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-300" htmlFor="city">
                  Città
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  placeholder="Es. Milano"
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none transition focus:border-white/20 focus:bg-zinc-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm text-zinc-300" htmlFor="note">
                  Nota personale
                </label>
                <span className="text-xs text-zinc-500">Max 300 caratteri</span>
              </div>
              <textarea
                id="note"
                name="note"
                maxLength={300}
                rows={5}
                placeholder="Perché lo/la consigli? Cosa ti ha colpito?"
                className="w-full resize-none rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none transition focus:border-white/20 focus:bg-zinc-900"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Salva raccomandazione
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

