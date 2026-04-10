"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { createClient } from "@/lib/supabase/browser";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Fetch initial count + real-time subscription ─────────────────────────
  useEffect(() => {
    const supabase = createClient();

    async function fetchCount() {
      const { count: c } = await supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true });
      setCount(c ?? 0);
    }

    fetchCount();

    const channel = supabase
      .channel("waitlist-count")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "waitlist" },
        () => {
          setCount((prev) => (prev !== null ? prev + 1 : null));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setStatus("loading");

    const supabase = createClient();
    const { error } = await supabase
      .from("waitlist")
      .insert({ email: trimmed });

    if (!error) {
      setStatus("success");
      setEmail("");
    } else if (error.code === "23505") {
      // unique violation
      setStatus("duplicate");
    } else {
      setStatus("error");
    }
  }

  const busy = status === "loading";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#0a0a0a] px-5 py-12 text-white">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/filo-logo-3d.png"
            alt="Filo"
            width={200}
            className="object-contain"
            style={{ mixBlendMode: "screen" }}
          />
        </div>

        {/* Title */}
        <h1 className="text-center text-[32px] font-bold leading-tight tracking-tight text-white">
          Filo sta arrivando
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-[320px] text-center text-[15px] leading-relaxed text-[#6b7280]">
          Il passaparola digitale italiano — trova professionisti di fiducia
          consigliati da persone reali che conosci.
        </p>

        {/* Live counter */}
        <div className="mt-6 flex justify-center">
          {count === null ? (
            <div className="h-5 w-40 animate-pulse rounded-full bg-[#1a1a1a]" />
          ) : (
            <motion.p
              key={count}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[14px] font-semibold text-[#0D9488]"
            >
              Già {count.toLocaleString("it-IT")} {count === 1 ? "persona" : "persone"} in lista
            </motion.p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
          <input
            ref={inputRef}
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== "idle" && status !== "success") setStatus("idle");
            }}
            placeholder="La tua email"
            disabled={busy || status === "success"}
            className="h-12 w-full rounded-full border border-[#1a1a1a] bg-[#111111] px-5 text-[15px] text-white placeholder:text-[#5c5f7a] outline-none transition focus:border-[#0D9488] disabled:opacity-50"
          />

          <motion.button
            type="submit"
            disabled={busy || status === "success"}
            whileTap={{ scale: 0.97 }}
            className="h-12 w-full rounded-full bg-[#0D9488] text-[15px] font-semibold text-white shadow-[0_0_24px_rgba(13,148,136,0.3)] transition hover:bg-[#0b7c76] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "…" : "Voglio essere tra i primi"}
          </motion.button>
        </form>

        {/* Feedback messages */}
        <div className="mt-4 min-h-[28px]">
          <AnimatePresence mode="wait">
            {status === "success" && (
              <motion.p
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-[14px] font-medium text-[#0D9488]"
              >
                Sei nella lista! Ti avvisiamo appena siamo live 🎉
              </motion.p>
            )}
            {status === "duplicate" && (
              <motion.p
                key="dup"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-[14px] text-[#6b7280]"
              >
                Questa email è già in lista — ci vediamo al lancio!
              </motion.p>
            )}
            {status === "error" && (
              <motion.p
                key="err"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-[14px] text-red-400"
              >
                Qualcosa è andato storto — riprova tra un momento.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-[12px] text-[#3a3a3a]">
          Nessuno spam. Solo un&apos;email quando siamo live.
        </p>
      </div>
    </div>
  );
}
