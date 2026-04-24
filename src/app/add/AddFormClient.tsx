"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addRecommendation } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { CityAutocomplete } from "@/components/CityAutocomplete";

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

type Category = (typeof CATEGORIES)[number];

type ProfessionalResult = {
  id: string;
  full_name: string | null;
  city: string | null;
  avatar_url: string | null;
  phone: string | null;
  work_address: string | null;
};

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).filter(Boolean).join("") || "?";
}

const AVATAR_COLORS = [
  "from-teal-600 to-cyan-500", "from-blue-600 to-indigo-500",
  "from-violet-600 to-purple-500", "from-rose-600 to-pink-500",
  "from-amber-600 to-orange-500", "from-emerald-600 to-teal-500",
];
function avatarColor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export function AddFormClient({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(addRecommendation, null);

  // Professional search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfessionalResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState<ProfessionalResult | null>(null);

  // Form fields that can be auto-filled
  const [category, setCategory] = useState<string>("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inputCls = "h-12 w-full rounded-2xl border border-[#232340] bg-[#16162a] px-4 text-sm text-white placeholder:text-[#5c5f7a] outline-none transition focus:border-[#0D9488]";
  const labelCls = "text-[11px] font-semibold uppercase tracking-widest text-[#5c5f7a]";

  // Debounced search
  useEffect(() => {
    if (selected) return;
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      setSearched(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, city, avatar_url, phone, work_address")
        .eq("account_type", "professional")
        .neq("id", userId)
        .ilike("full_name", `%${query}%`)
        .limit(6);
      setResults(data ?? []);
      setSearched(true);
      setShowDropdown(true);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, userId, selected]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectProfessional(prof: ProfessionalResult) {
    setSelected(prof);
    setQuery(prof.full_name ?? "");
    if (prof.city) setCity(prof.city);
    if (prof.phone) setPhone(prof.phone);
    if (prof.work_address) setAddress(prof.work_address);
    setShowDropdown(false);
    setResults([]);
  }

  function clearSelection() {
    setSelected(null);
    setQuery("");
    setCity("");
    setCategory("");
    setPhone("");
    setAddress("");
    setSearched(false);
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {state?.error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </div>
      )}

      {/* Hidden field for professional_id */}
      <input type="hidden" name="professionalId" value={selected?.id ?? ""} />

      {/* Professional name search */}
      <div className="space-y-1.5">
        <label className={labelCls} htmlFor="professionalName">
          Nome del professionista
        </label>
        <div className="relative" ref={dropdownRef}>
          <div className="relative flex items-center">
            <input
              id="professionalName"
              name="professionalName"
              type="text"
              required
              autoComplete="off"
              placeholder="Cerca o scrivi il nome…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (selected) setSelected(null);
              }}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              className={`${inputCls} ${selected ? "pr-24" : ""}`}
            />
            {selected && (
              <span className="pointer-events-none absolute right-10 flex items-center gap-1 rounded-full bg-teal-500/15 px-2 py-0.5 text-[11px] font-semibold text-teal-400">
                Su Filo ✓
              </span>
            )}
            {query && (
              <button
                type="button"
                onClick={clearSelection}
                className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full text-[#5c5f7a] transition hover:text-white"
                aria-label="Cancella"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && !selected && (
            <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 overflow-hidden rounded-2xl border border-[#232340] bg-[#111111] shadow-2xl">
              {results.length > 0 ? (
                <>
                  {results.map((prof) => (
                    <button
                      key={prof.id}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); selectProfessional(prof); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#16162a]"
                    >
                      {/* Avatar */}
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(prof.id)} text-xs font-bold text-white overflow-hidden`}>
                        {prof.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={prof.avatar_url} alt={prof.full_name ?? ""} className="h-full w-full object-cover" />
                        ) : (
                          initials(prof.full_name ?? "?")
                        )}
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{prof.full_name}</p>
                        <p className="truncate text-[11px] text-[#6b7280]">
                          {prof.city ?? ""}
                        </p>
                      </div>
                      {/* Badge */}
                      <span className="shrink-0 rounded-full bg-teal-500/15 px-2 py-0.5 text-[10px] font-semibold text-teal-400">
                        Su Filo
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-[#232340] px-4 py-2.5">
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); setShowDropdown(false); }}
                      className="text-xs text-[#5c5f7a] transition hover:text-white"
                    >
                      Non è su Filo — continua con questo nome
                    </button>
                  </div>
                </>
              ) : searched ? (
                <div className="px-4 py-4">
                  <p className="text-sm text-[#5c5f7a]">Nessun professionista trovato su Filo</p>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); setShowDropdown(false); }}
                    className="mt-1.5 text-xs text-[#0D9488] transition hover:text-[#0b7c76]"
                  >
                    Continua comunque con questo nome →
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Category + City */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className={labelCls} htmlFor="category">Categoria</label>
          <select
            id="category"
            name="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
          >
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
          <CityAutocomplete
            name="city"
            value={city}
            onChange={setCity}
            required
            placeholder="Es. Milano"
            className={inputCls}
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <label className={labelCls} htmlFor="address">
          Indirizzo <span className="normal-case font-normal text-[#5c5f7a]">(opzionale)</span>
        </label>
        <input
          id="address"
          name="address"
          type="text"
          placeholder="Es. Via Roma 15, centro"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className={labelCls} htmlFor="phone">
          Numero di telefono <span className="normal-case font-normal text-[#5c5f7a]">(opzionale)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+39 02 1234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Price range */}
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

      {/* Note */}
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
        disabled={pending}
        className="mt-2 h-12 w-full rounded-2xl bg-[#0D9488] text-sm font-semibold text-white shadow-[0_0_24px_rgba(13,148,136,0.35)] transition hover:bg-[#0b7c76] active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Salvataggio…" : "Salva raccomandazione"}
      </button>
    </form>
  );
}
