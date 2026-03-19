"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/browser";
import { BottomNav } from "@/components/BottomNav";

const BASE_URL = "https://filo-kappa.vercel.app";

const AVATAR_COLORS = [
  "bg-violet-600", "bg-blue-600", "bg-emerald-600", "bg-rose-600",
  "bg-amber-600", "bg-cyan-600", "bg-pink-600", "bg-indigo-600",
];

function avatarColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2)
    .map((p) => p[0]?.toUpperCase()).filter(Boolean).join("") || "U";
}

function toSlug(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

type Profile = {
  id: string;
  full_name: string | null;
  city: string | null;
  username: string | null;
  avatar_url: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copiedProfile, setCopiedProfile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) { router.push("/login"); return; }

        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, city, username, avatar_url")
          .eq("id", user.id)
          .single();

        const profileData = (data ?? {}) as Profile;
        // fallback full_name e city da user_metadata se il profilo non li ha
        if (!profileData.full_name) {
          profileData.full_name = user.user_metadata?.full_name ?? null;
        }
        if (!profileData.city) {
          profileData.city = user.user_metadata?.city ?? null;
        }
        setUserId(user.id);
        setEmail(user.email ?? "");
        setProfile(profileData);
        setAvatarUrl(profileData.avatar_url ?? user.user_metadata?.avatar_url ?? "");
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fullName = profile?.full_name ?? "Utente";
  const city = profile?.city ?? "";
  const username = profile?.username ?? toSlug(fullName);
  const color = avatarColor(fullName);
  const profileUrl = `${BASE_URL}/p/${username}`;
  const inviteUrl = `${BASE_URL}/invite/${username}`;
  const whatsappText = `Ho trovato un'app fantastica per trovare professionisti di fiducia — iscriviti gratis: ${inviteUrl}`;

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = urlData.publicUrl;
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
      await supabase.auth.updateUser({ data: { avatar_url: url } });
      setAvatarUrl(url);
    } catch (err) {
      console.error("Avatar upload error:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#0a0a0a]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-40 border-b border-[#222222] bg-[#0a0a0a]">
        <div className="mx-auto flex h-12 max-w-[430px] items-center justify-center px-4">
          <span className="text-base font-bold tracking-tight">Filo</span>
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-24 pt-6 space-y-4">

        {/* Avatar + nome */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-2 ring-[#8B5CF6]/60 transition hover:ring-[#8B5CF6] active:scale-95 ${color}`}
            aria-label="Cambia foto profilo"
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt={fullName} fill className="object-cover" unoptimized />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                {initials(fullName)}
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition hover:opacity-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} className="h-5 w-5">
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
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

          <div>
            <h1 className="text-xl font-bold tracking-tight">{fullName}</h1>
            {city ? <p className="mt-0.5 text-sm text-[#9CA3AF]">{city}</p> : null}
          </div>
        </div>

        {/* Condividi profilo */}
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(profileUrl);
            setCopiedProfile(true);
            setTimeout(() => setCopiedProfile(false), 2000);
          }}
          className="h-10 w-full rounded-2xl border border-[#222222] bg-[#111111] text-sm font-medium text-white transition hover:border-[#8B5CF6]/50 hover:text-[#A78BFA]"
        >
          {copiedProfile ? "Link copiato!" : "Condividi il tuo profilo"}
        </button>

        {/* Invita amici */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] text-sm font-semibold text-white shadow-[0_0_20px_rgba(37,211,102,0.25)] transition hover:bg-[#1ebe5d] active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          Invita un amico
        </a>

        {/* Email */}
        <div className="rounded-2xl border border-[#222222] bg-[#111111] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">Account</p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-sm text-[#9CA3AF]">Email</span>
            <span className="truncate text-sm text-white">{email}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="h-11 w-full rounded-2xl border border-[#222222] bg-[#111111] text-sm font-medium text-[#9CA3AF] transition hover:border-red-500/40 hover:text-red-400"
        >
          Logout
        </button>

      </main>

      <BottomNav />
    </div>
  );
}
