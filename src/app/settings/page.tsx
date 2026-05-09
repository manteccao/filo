"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/browser";
import { BottomNav } from "@/components/BottomNav";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { deleteAccount } from "./actions";
import { avatarColor, avatarInitials } from "@/lib/avatar";

const BASE_URL = "https://filo.network";

function toSlug(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const inputCls = "h-11 w-full rounded-2xl border border-border bg-background px-3.5 text-sm text-white placeholder:text-subdued outline-none transition focus:border-primary";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [city, setCity] = useState("");
  const [savingCity, setSavingCity] = useState(false);
  const [citySaved, setCitySaved] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);
  const [isProfessional, setIsProfessional] = useState(false);
  const [phone, setPhone] = useState("+39 ");
  const [workAddress, setWorkAddress] = useState("");
  const [savingPro, setSavingPro] = useState(false);
  const [proSaved, setProSaved] = useState(false);
  const [proError, setProError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedProfile, setCopiedProfile] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) { router.push("/login"); return; }

        const { data: profile } = await supabase
          .from("profiles").select("full_name, username, avatar_url, city, account_type, phone, work_address").eq("id", user.id).single();

        const p = profile as { full_name?: string | null; username?: string | null; avatar_url?: string | null; city?: string | null; account_type?: string | null; phone?: string | null; work_address?: string | null } | null;
        const name = p?.full_name ?? user.user_metadata?.full_name ?? "Utente";
        const uname = p?.username ?? toSlug(name);

        setUserId(user.id);
        setEmail(user.email ?? "");
        setFullName(name);
        setUsername(uname);
        setAvatarUrl(p?.avatar_url ?? user.user_metadata?.avatar_url ?? "");
        setCity(p?.city ?? "");
        setIsProfessional(p?.account_type === "professional");
        setPhone(p?.phone ?? "+39 ");
        setWorkAddress(p?.work_address ?? "");
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    setUploadError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/avatar.${ext}`;
      const { error: storageError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (storageError) throw storageError;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = urlData.publicUrl;
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
      await supabase.auth.updateUser({ data: { avatar_url: url } });
      setAvatarUrl(url);
    } catch {
      setUploadError("Errore durante il caricamento della foto. Riprova.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSaveCity() {
    if (!city.trim() || !userId) return;
    setSavingCity(true);
    setCityError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .update({ city: city.trim() })
        .eq("id", userId)
        .select("city");
      if (error) {
        setCityError(`Errore: ${error.message}`);
        return;
      }
      if (!data || data.length === 0) {
        setCityError("Impossibile salvare la città. Riprova.");
        return;
      }
      setCitySaved(true);
      setTimeout(() => setCitySaved(false), 2000);
    } catch {
      setCityError("Errore imprevisto, riprova.");
    } finally {
      setSavingCity(false);
    }
  }

  async function handleSaveProDetails() {
    if (!userId) return;
    setSavingPro(true);
    setProError(null);
    try {
      const supabase = createClient();
      const cleanPhone = phone.trim().replace(/^\+39\s*$/, "").trim() || null;
      const { error } = await supabase
        .from("profiles")
        .update({ phone: cleanPhone, work_address: workAddress.trim() || null })
        .eq("id", userId);
      if (error) { setProError(`Errore: ${error.message}`); return; }
      setProSaved(true);
      setTimeout(() => setProSaved(false), 2000);
    } catch {
      setProError("Errore imprevisto, riprova.");
    } finally {
      setSavingPro(false);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const result = await deleteAccount();
      if ("error" in result) {
        setDeleteError(result.error);
        setDeleteLoading(false);
        return;
      }
      // Account deleted — sign out and go to login
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch {
      setDeleteError("Errore imprevisto. Riprova o contatta il supporto.");
      setDeleteLoading(false);
    }
  }

  const gradient = avatarColor(fullName || "U");
  const profileUrl = `${BASE_URL}/p/${username}`;
  const inviteUrl = `${BASE_URL}/invite/${username}`;
  const whatsappText = `Ho trovato un'app fantastica per trovare professionisti di fiducia — iscriviti gratis: ${inviteUrl}`;

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-background text-white">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[430px] items-center gap-3 px-4">
          <Link href="/profile" className="text-muted-foreground transition hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <span className="text-[15px] font-bold">Impostazioni</span>
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-28 pt-4 space-y-3">

        {/* Avatar */}
        <div className="flex flex-col items-center gap-2 py-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`relative h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br ${gradient} ring-2 ring-teal-500/30 ring-offset-2 ring-offset-[#0d0d17] transition active:scale-95`}
            aria-label="Cambia foto profilo"
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt={fullName} fill className="object-cover" unoptimized />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                {avatarInitials(fullName)}
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition hover:opacity-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </span>
            {uploading && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/60">
                <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </span>
            )}
          </button>
          <p className="text-xs text-muted-foreground">Tocca per cambiare foto</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
        </div>

        {/* Account */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Account</p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="truncate text-sm text-white">{email}</span>
          </div>
        </div>

        {/* Città */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">La tua città</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1">
              <CityAutocomplete
                value={city}
                onChange={(v) => { setCity(v); setCityError(null); }}
                placeholder="Es. Milano"
                className={inputCls}
              />
            </div>
            <button
              type="button"
              onClick={handleSaveCity}
              disabled={savingCity || !city.trim()}
              className="h-11 shrink-0 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              {savingCity ? "…" : citySaved ? "Salvata ✓" : "Salva"}
            </button>
          </div>
          {cityError && (
            <p className="mt-2 text-xs text-red-400">{cityError}</p>
          )}
        </div>

        {/* Dati professionali */}
        {isProfessional && (
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Dati professionali</p>
            <div>
              <label className="mb-1.5 block text-[11px] text-muted-foreground">Telefono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setProError(null); }}
                placeholder="+39 02 1234567"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] text-muted-foreground">Indirizzo studio</label>
              <input
                type="text"
                value={workAddress}
                onChange={(e) => { setWorkAddress(e.target.value); setProError(null); }}
                placeholder="Es. Via Roma 15, Milano"
                className={inputCls}
              />
            </div>
            {proError && <p className="text-xs text-red-400">{proError}</p>}
            <button
              type="button"
              onClick={handleSaveProDetails}
              disabled={savingPro}
              className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              {savingPro ? "…" : proSaved ? "Salvato ✓" : "Salva dati professionali"}
            </button>
          </div>
        )}

        {/* Condividi profilo */}
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(profileUrl);
            setCopiedProfile(true);
            setTimeout(() => setCopiedProfile(false), 2000);
          }}
          className="h-12 w-full rounded-2xl border border-border bg-card text-sm font-medium text-white transition hover:border-teal-500/40 active:scale-[0.98]"
        >
          {copiedProfile ? "Link copiato!" : "Condividi il tuo profilo"}
        </button>

        {/* Invita */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-whatsapp text-sm font-semibold text-white shadow-[0_0_20px_rgba(37,211,102,0.2)] transition hover:bg-whatsapp-hover active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          Invita un amico
        </a>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="h-12 w-full rounded-2xl border border-red-500/25 bg-red-500/8 text-sm font-medium text-red-400 transition hover:bg-red-500/15 active:scale-[0.98]"
        >
          Logout
        </button>

        {/* Elimina account */}
        <button
          type="button"
          onClick={() => setDeleteConfirm(true)}
          className="h-12 w-full rounded-2xl bg-red-600 text-sm font-semibold text-white shadow-[0_0_20px_rgba(220,38,38,0.25)] transition hover:bg-red-700 active:scale-[0.98]"
        >
          Elimina account
        </button>

      </main>

      {/* Delete account confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6 text-red-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <h2 className="mt-4 text-base font-bold text-white">Elimina account</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sei sicuro? Tutti i tuoi dati verranno eliminati permanentemente: raccomandazioni, commenti, connessioni e profilo.
            </p>
            <p className="mt-2 text-xs text-red-400">Questa operazione non può essere annullata.</p>

            {deleteError && (
              <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {deleteError}
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => { setDeleteConfirm(false); setDeleteError(null); }}
                disabled={deleteLoading}
                className="h-11 flex-1 rounded-2xl border border-border text-sm text-muted-foreground transition hover:text-white disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="h-11 flex-1 rounded-2xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Eliminazione…
                  </span>
                ) : "Elimina tutto"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
