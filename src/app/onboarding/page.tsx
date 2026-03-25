"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/browser";

const BASE_URL = "https://filo-kappa.vercel.app";

const CATEGORIES = [
  "dentista", "medico", "avvocato", "commercialista",
  "idraulico", "elettricista", "altro",
] as const;

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
  const [saving, setSaving] = useState(false);

  const [profName, setProfName] = useState("");
  const [category, setCategory] = useState("dentista");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setFullName(user.user_metadata?.full_name ?? "Utente");
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
      setUsername((profile as { username?: string | null } | null)?.username ?? "");
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddRec(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("recommendations").insert({ user_id: user.id, professional_name: profName, category, city, note });
    } catch (_) {
      // proceed even on error
    } finally {
      setSaving(false);
      setStep(3);
    }
  }

  const inviteUrl = username ? `${BASE_URL}/invite/${username}` : BASE_URL;
  const whatsappText = `Ho trovato un'app fantastica per trovare professionisti di fiducia — iscriviti gratis: ${inviteUrl}`;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#0d0d17] px-6 py-12 text-white">
      <div className="w-full max-w-sm">
        <ProgressBar step={step} />
        <p className="mt-2 text-right text-xs text-[#5c5f7a]">{step} di 3</p>

        {/* Step 1 — Benvenuto */}
        {step === 1 && (
          <div className="mt-10 flex flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/filo-logo-3d.png" alt="Filo" className="h-9 w-auto object-contain" style={{ mixBlendMode: "screen" }} />

            <h1 className="mt-8 text-2xl font-bold leading-tight">
              Benvenuto su Filo,<br />
              <span className="text-teal-400">{fullName.split(" ")[0]}!</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#8b8fa8]">
              Il social network della fiducia — trova professionisti
              consigliati da persone reali che conosci.
            </p>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-8 h-12 w-full rounded-2xl bg-[#0D9488] text-sm font-semibold text-white shadow-[0_0_24px_rgba(13,148,136,0.35)] transition hover:bg-[#0b7c76] active:scale-[0.98]"
            >
              Inizia
            </button>
          </div>
        )}

        {/* Step 2 — Prima raccomandazione */}
        {step === 2 && (
          <div className="mt-8">
            <h1 className="text-xl font-bold leading-tight">Aggiungi il tuo primo professionista</h1>
            <p className="mt-2 text-sm text-[#8b8fa8]">
              Hai un dentista, medico o avvocato che consiglieresti a un amico?
            </p>

            <form onSubmit={handleAddRec} className="mt-6 space-y-3">
              <input value={profName} onChange={(e) => setProfName(e.target.value)} required placeholder="Nome del professionista" className={inputCls} />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#16162a]">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <input value={city} onChange={(e) => setCity(e.target.value)} required placeholder="Città" className={inputCls} />
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

            <button type="button" onClick={() => setStep(3)} className="mt-3 w-full text-center text-sm text-[#5c5f7a] transition hover:text-[#8b8fa8]">
              Salta per ora
            </button>
          </div>
        )}

        {/* Step 3 — Invita amici */}
        {step === 3 && (
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
              href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
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
      </div>
    </div>
  );
}
