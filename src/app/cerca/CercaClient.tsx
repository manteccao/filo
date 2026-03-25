"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/browser";
import { BottomNav } from "@/components/BottomNav";
import type { CityMarker } from "./MapboxView";

const MapboxView = dynamic(() => import("./MapboxView"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#0a0a0a]" />
  ),
});

// ─── City coordinates ─────────────────────────────────────────────────────────

const CITY_COORDS: Record<string, [number, number]> = {
  "roma": [41.9028, 12.4964],
  "milano": [45.4642, 9.19],
  "napoli": [40.8518, 14.2681],
  "torino": [45.0703, 7.6869],
  "palermo": [38.1157, 13.3615],
  "genova": [44.4056, 8.9463],
  "bologna": [44.4949, 11.3426],
  "firenze": [43.7696, 11.2558],
  "bari": [41.1171, 16.8719],
  "catania": [37.5079, 15.083],
  "venezia": [45.4408, 12.3155],
  "verona": [45.4384, 10.9916],
  "messina": [38.1938, 15.554],
  "padova": [45.4064, 11.8768],
  "trieste": [45.6495, 13.7768],
  "brescia": [45.5416, 10.2118],
  "taranto": [40.4641, 17.247],
  "prato": [43.8777, 11.1026],
  "modena": [44.6471, 10.9252],
  "perugia": [43.1107, 12.3908],
  "livorno": [43.5485, 10.3106],
  "ravenna": [44.4184, 12.2035],
  "cagliari": [39.2238, 9.1217],
  "bergamo": [45.6983, 9.6773],
  "trento": [46.0748, 11.1217],
  "lecce": [40.3515, 18.175],
  "ancona": [43.6158, 13.5189],
  "salerno": [40.6824, 14.7681],
  "ferrara": [44.8381, 11.6198],
  "sassari": [40.7268, 8.5596],
  "pescara": [42.4618, 14.216],
  "monza": [45.5845, 9.2744],
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Recommender = {
  user_id: string;
  full_name: string | null;
  username: string | null;
};

type Professional = {
  name: string;
  category: string;
  city: string;
  slug: string;
  count: number;
  recommenders: Recommender[];
  lat?: number;
  lng?: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["tutti", "dentista", "avvocato", "commercialista", "idraulico", "elettricista", "medico", "altro"];

const AVATAR_COLORS = [
  "from-teal-600 to-cyan-500",
  "from-blue-600 to-indigo-500",
  "from-violet-600 to-purple-500",
  "from-rose-600 to-pink-500",
  "from-amber-600 to-orange-500",
  "from-emerald-600 to-teal-500",
  "from-cyan-600 to-blue-500",
  "from-fuchsia-600 to-violet-500",
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function avatarColor(seed: string) {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2)
    .map((p) => p[0]?.toUpperCase()).filter(Boolean).join("") || "?";
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function toSlug(name: string) {
  return encodeURIComponent(name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CercaClient({ currentUserId }: { currentUserId: string }) {
  const [categoryFilter, setCategoryFilter] = useState("tutti");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: follows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUserId);

      const followedIds = (follows ?? []).map((f) => f.following_id as string).filter(Boolean);

      const [{ data: recs }, { data: followedProfiles }] = await Promise.all([
        followedIds.length > 0
          ? supabase.from("recommendations").select("user_id,professional_name,category,city").in("user_id", followedIds)
          : Promise.resolve({ data: [] }),
        followedIds.length > 0
          ? supabase.from("profiles").select("id,full_name,username").in("id", followedIds)
          : Promise.resolve({ data: [] }),
      ]);

      const profileById = new Map((followedProfiles ?? []).map((p) => [p.id as string, p]));

      const proMap = new Map<string, Professional>();
      for (const r of recs ?? []) {
        const key = `${r.professional_name?.toLowerCase()}|${r.category}|${r.city?.toLowerCase()}`;
        const prof = profileById.get(r.user_id);
        const rec: Recommender = {
          user_id: r.user_id,
          full_name: prof?.full_name ?? null,
          username: prof?.username ?? null,
        };

        if (proMap.has(key)) {
          const existing = proMap.get(key)!;
          existing.count++;
          if (!existing.recommenders.find((x) => x.user_id === r.user_id)) {
            existing.recommenders.push(rec);
          }
        } else {
          const cityKey = (r.city ?? "").toLowerCase().trim();
          const coords = CITY_COORDS[cityKey];
          proMap.set(key, {
            name: r.professional_name,
            category: r.category,
            city: r.city,
            slug: toSlug(r.professional_name),
            count: 1,
            recommenders: [rec],
            lat: coords?.[0],
            lng: coords?.[1],
          });
        }
      }

      setProfessionals(Array.from(proMap.values()).sort((a, b) => b.count - a.count));
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // City markers — one per city, filtered by category
  const cityMarkers: CityMarker[] = useMemo(() => {
    const map = new Map<string, CityMarker>();
    for (const p of professionals) {
      if (p.lat === undefined || p.lng === undefined) continue;
      if (categoryFilter !== "tutti" && p.category !== categoryFilter) continue;
      const key = p.city.toLowerCase();
      if (map.has(key)) {
        map.get(key)!.count += p.count;
      } else {
        map.set(key, { city: p.city, lat: p.lat, lng: p.lng, count: p.count });
      }
    }
    return Array.from(map.values());
  }, [professionals, categoryFilter]);

  // Professionals for the selected city
  const cityPros = useMemo(() => {
    if (!selectedCity) return [];
    return professionals.filter(
      (p) =>
        p.city.toLowerCase() === selectedCity.toLowerCase() &&
        (categoryFilter === "tutti" || p.category === categoryFilter)
    );
  }, [professionals, selectedCity, categoryFilter]);

  function handleCityClick(city: string) {
    setSelectedCity((prev) =>
      prev?.toLowerCase() === city.toLowerCase() ? null : city
    );
  }

  return (
    <div className="relative bg-[#0a0a0a]" style={{ height: "calc(100dvh - 72px)" }}>

      {/* Map — fills parent */}
      {loading ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0D9488] border-t-transparent" />
        </div>
      ) : (
        <MapboxView
          markers={cityMarkers}
          selectedCity={selectedCity}
          onCityClick={handleCityClick}
        />
      )}

      {/* Floating category pills */}
      <div className="absolute left-0 right-0 top-4 z-10 px-4">
        <div
          className="flex gap-2 overflow-x-auto rounded-2xl py-1"
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => { setCategoryFilter(cat); setSelectedCity(null); }}
              className={`shrink-0 rounded-full px-3 py-[7px] text-[12px] font-semibold backdrop-blur-md transition ${
                categoryFilter === cat
                  ? "bg-[#0D9488] text-white shadow-[0_0_12px_rgba(13,148,136,0.5)]"
                  : "bg-[#0a0a0a]/80 text-[#9ca3af]"
              }`}
            >
              {capitalize(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom sheet — slides up on city click */}
      <AnimatePresence>
        {selectedCity && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCity(null)}
              className="absolute inset-0 z-20"
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="absolute bottom-0 left-0 right-0 z-30 flex max-h-[65%] flex-col rounded-t-3xl bg-[#111111]"
            >
              {/* Handle */}
              <div className="flex shrink-0 justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-[#2a2a2a]" />
              </div>

              {/* Header */}
              <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-1">
                <div>
                  <p className="text-base font-bold text-white">{capitalize(selectedCity)}</p>
                  <p className="text-[12px] text-[#6b7280]">
                    {cityPros.length} {cityPros.length === 1 ? "professionista" : "professionisti"} consigliati da amici
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCity(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a1a] text-[#6b7280] transition hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="h-px bg-[#1a1a1a] shrink-0" />

              {/* List */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {cityPros.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#6b7280]">Nessun risultato con questi filtri.</p>
                ) : (
                  cityPros.map((p, i) => (
                    <div key={i} className="rounded-2xl bg-[#0a0a0a] p-4">
                      {/* Name + category */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-bold text-white">{p.name}</p>
                          <span className="mt-1 inline-block rounded-full bg-[#0D9488]/15 px-2 py-[2px] text-[11px] text-[#0D9488]">
                            {capitalize(p.category)}
                          </span>
                        </div>
                        <Link
                          href={`/pro/${p.slug}`}
                          className="shrink-0 rounded-full bg-[#0D9488]/15 px-3 py-1.5 text-[12px] font-semibold text-[#0D9488] transition hover:bg-[#0D9488]/25"
                        >
                          Vedi tutte
                        </Link>
                      </div>

                      {/* Recommenders */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {p.recommenders.map((rec) => {
                          const name = rec.full_name ?? "Utente";
                          const color = avatarColor(rec.user_id);
                          return (
                            <div key={rec.user_id} className="flex items-center gap-1.5">
                              <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${color} text-[8px] font-bold text-white`}>
                                {initials(name)}
                              </div>
                              {rec.username ? (
                                <Link href={`/p/${rec.username}`} className="text-[12px] text-[#9ca3af] transition hover:text-white">
                                  {name.split(" ")[0]}
                                </Link>
                              ) : (
                                <span className="text-[12px] text-[#9ca3af]">{name.split(" ")[0]}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
