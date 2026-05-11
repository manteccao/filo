import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProfilePageClient from "./ProfilePageClient";

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  // Try by username first; if slug is a UUID (no-username fallback), try by id
  let { data: profile } = await supabase
    .from("profiles")
    .select("full_name, city")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    const { data: byId } = await supabase
      .from("profiles")
      .select("full_name, city")
      .eq("id", username)
      .maybeSingle();
    profile = byId ?? null;
  }

  if (!profile) return { title: "Profilo non trovato" };

  const name = profile.full_name ?? username;
  const title = `${name} su Filo`;
  const description = `Scopri i professionisti di fiducia raccomandati da ${name}${profile.city ? ` a ${profile.city}` : ""} su Filo.`;

  return {
    title,
    description,
    alternates: { canonical: `https://filo.network/p/${username}` },
    openGraph: {
      title,
      description,
      url: `https://filo.network/p/${username}`,
      images: [
        {
          url: `/api/og?name=${encodeURIComponent(name)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default function Page() {
  return <ProfilePageClient />;
}
