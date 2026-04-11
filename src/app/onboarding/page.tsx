"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/browser";

const BASE_URL = "https://filo-kappa.vercel.app";

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

type AccountType = "user" | "professional";
type Step = 1 | 2 | 3;

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-1.5">
      {([1, 2, 3] as Step[]).map((s) => (
        <div
          key={s}
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= step ? "bg-[#0D9488]" : "bg-[#232340]"}`}
        />
      ))}
    </div>
  );
}

const inputCls = "h-12 w-full rounded-2xl border border-[#232340] bg-[#16162a] px-4 text-sm text-white placeholder:text-[#5c5f7a] outline-none transition focus:border-[#0D9488]";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [saving, setSaving] = useState(false);

  // User path
  const [profName, setProfName] = useState("");
  const [category, setCategory] = useState("dentista");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");

  // Professional path
  const [proCategory, setProCategory] = useState("dentista");
  const [proCity, setProCity] = useState("");
  const [proPhone, setProPhone] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      setFullName(user.user_metadata?.full_name ?? "Utente");
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, city")
        .eq("id", user.id)
        .single();
      setUsername((profile as { username?: string | null } | null)?.username ?? "");
      setProCity((profile as { city?: string | null } | null)?.city ?? "");
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAccountTypeChoice(type: AccountType) {
    setAccountType(type);
    if (type === "user") {
      // Default is 'user', no DB update needed
      setStep(2);
    } else {
      setStep(2);
    }
  }

  async function handleAddRec(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) return;
      if (!profName.trim() || !city.trim()) return;
      await supabase.from("recommendations").insert({
        user_id: user.id,
        professional_name: profName.trim(),
        category,
        city: city.trim(),
        note: note.slice(0, 300),
      });
    } catch (_) {
      // proceed even on error
    } finally {
      setSaving(false);
      setStep(3);
    }
  }

  async function handleProDetails(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.from("profiles").update({
        account_type: "professional",
        professional_category: proCategory,
        professional_phone: proPhone.trim() || null,
        ...(proCity.trim() ? { city: proCity.trim() } : {}),
      }).eq("id", userId);
    } catch (_) {
      // proceed even on error
    } finally {
      setSaving(false);
      setStep(3);
    }
  }

  const inviteUrl = username ? `${BASE_URL}/invite/${username}` : BASE_URL;
  const proInviteUrl = username ? `${BASE_URL}/raccomanda/${username}` : BASE_URL;
  const whatsappUserText = `Ho trovato un'app fantastica per trovare professionisti di fiducia — iscriviti gratis: ${inviteUrl}`;
  const whatsappProText = `Ciao! Sono su Filo, la piattaforma del passaparola professionale. Se vuoi raccomandarmi ai tuoi contatti, ecco il mio link: ${proInviteUrl}`;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#0d0d17] px-6 py-12 text-white">
      <div className="w-full max-w-sm">
        <ProgressBar step={step} />
        <p className="mt-2 text-right text-xs text-[#5c5f7a]">{step} di 3</p>

        {/* ── Step 1 — Tipo account ──────────────────────────────── */}
        {step === 1 && (
          <div className="mt-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/filo-logo-3d.png"
              alt="Filo"
              className="mx-auto mb-6 h-9 w-auto object-contain"
              style={{ mixBlendMode: "screen" }}
            />
            <h1 className="text-center text-2xl font-bold leading-tight">
              Benvenuto su Filo,{" "}
              <span className="text-teal-400">{fullName.split(" ")[0]}!</span>
            </h1>
            <p className="mt-2 text-center text-sm text-[#8b8fa8]">
              Come vuoi usare Filo?
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleAccountTypeChoice("user")}
                className="flex items-center gap-4 rounded-2xl border border-[#232340] bg-[#16162a] p-4 text-left transition hover:border-[#0D9488]/50 active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0D9488]/15">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth={1.8} className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">Sono un utente</p>
                  <p className="mt-0.5 text-xs text-[#8b8fa8]">
                    Cerco professionisti di fiducia consigliati da chi conosco
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAccountTypeChoice("professional")}
                className="flex items-center gap-4 rounded-2xl border border-[#232340] bg-[#16162a] p-4 text-left transition hover:border-[#0D9488]/50 active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0D9488]/15">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth={1.8} className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">Sono un professionista</p>
                  <p className="mt-0.5 text-xs text-[#8b8fa8]">
                    Voglio essere raccomandato dai miei clienti su Filo
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2 (utente) — Prima raccomandazione ────────────── */}
        {step === 2 && accountType === "user" && (
          <div className="mt-8">
            <h1 className="text-xl font-bold leading-tight">
              Aggiungi il tuo primo professionista
            </h1>
            <p className="mt-2 text-sm text-[#8b8fa8]">
              Hai un dentista, medico o avvocato che consiglieresti a un amico?
            </p>

            <form onSubmit={handleAddRec} className="mt-6 space-y-3">
              <input
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                required
                placeholder="Nome del professionista"
                className={inputCls}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#16162a]">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                placeholder="Città"
                className={inputCls}
              />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 300))}
                rows={3}
                placeholder="Perché lo consigli? (opzionale)"
                className="w-full resize-none rounded-2xl border border-[#232340] bg-[#16162a] px-4 py-3 text-sm text-white placeholder:text-[#5c5f7a] outline-none transition focus:border-[#0D9488]"
              />
              <button
                type="submit"
                disabled={saving}
                className="h-12 w-full rounded-2xl bg-[#0D9488] text-sm font-semibold text-white shadow-[0_0_24px_rgba(13,148,136,0.3)] transition hover:bg-[#0b7c76] disabled:opacity-50 active:scale-[0.98]"
              >
                {saving ? "Salvataggio…" : "Aggiungi"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="mt-3 w-full text-center text-sm text-[#5c5f7a] transition hover:text-[#8b8fa8]"
            >
              Salta per ora
            </button>
          </div>
        )}

        {/* ── Step 2 (professionista) — Dati professionali ────────── */}
        {step === 2 && accountType === "professional" && (
          <div className="mt-8">
            <h1 className="text-xl font-bold leading-tight">Raccontaci di te</h1>
            <p className="mt-2 text-sm text-[#8b8fa8]">
              Compila il tuo profilo professionale per essere trovato facilmente.
            </p>

            <form onSubmit={handleProDetails} className="mt-6 space-y-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#5c5f7a]">
                  Categoria professionale
                </label>
                <select
                  value={proCategory}
                  onChange={(e) => setProCategory(e.target.value)}
                  required
                  className={inputCls}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#16162a]">
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#5c5f7a]">
                  Città in cui lavori
                </label>
                <input
                  value={proCity}
                  onChange={(e) => setProCity(e.target.value)}
                  required
                  placeholder="Es. Milano"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#5c5f7a]">
                  Telefono{" "}
                  <span className="normal-case font-normal text-[#5c5f7a]">(opzionale)</span>
                </label>
                <input
                  type="tel"
                  value={proPhone}
                  onChange={(e) => setProPhone(e.target.value)}
                  placeholder="+39 02 1234567"
                  className={inputCls}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="h-12 w-full rounded-2xl bg-[#0D9488] text-sm font-semibold text-white shadow-[0_0_24px_rgba(13,148,136,0.3)] transition hover:bg-[#0b7c76] disabled:opacity-50 active:scale-[0.98]"
              >
                {saving ? "Salvataggio…" : "Continua"}
              </button>
            </form>
          </div>
        )}

        {/* ── Step 3 (utente) — Invita amici ────────────────────── */}
        {step === 3 && accountType === "user" && (
          <div className="mt-10 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#25D366]/15">
              <svg viewBox="0 0 24 24" fill="#25D366" className="h-8 w-8">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <h1 className="mt-5 text-xl font-bold">Invita i tuoi amici</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#8b8fa8]">
              Filo funziona meglio con persone che conosci. Invita qualcuno e costruite insieme una rete di fiducia.
            </p>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(whatsappUserText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,211,102,0.25)] transition hover:bg-[#1ebe5d] active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Invita su WhatsApp
            </a>
            <Link href="/feed" className="mt-4 text-sm text-[#5c5f7a] transition hover:text-[#8b8fa8]">
              Vai al feed →
            </Link>
          </div>
        )}

        {/* ── Step 3 (professionista) — Invita clienti ──────────── */}
        {step === 3 && accountType === "professional" && (
          <div className="mt-8 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0D9488]/15">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth={1.8} className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </div>

            <h1 className="mt-5 text-xl font-bold">Invita i tuoi clienti</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#8b8fa8]">
              Condividi il tuo link personale — i tuoi clienti possono raccomandarti
              su Filo in pochi secondi.
            </p>

            {/* Link box */}
            <div className="mt-6 w-full rounded-2xl border border-[#232340] bg-[#16162a] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#5c5f7a]">
                Il tuo link personale
              </p>
              <p className="mt-1.5 break-all text-[13px] font-medium text-[#0D9488]">
                {proInviteUrl}
              </p>
            </div>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(whatsappProText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,211,102,0.25)] transition hover:bg-[#1ebe5d] active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Condividi su WhatsApp
            </a>

            <Link href="/feed" className="mt-4 text-sm text-[#5c5f7a] transition hover:text-[#8b8fa8]">
              Vai al feed →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
