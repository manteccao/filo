"use client";

import { useState } from "react";

export function ShareProfileButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/p/${username}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/50 px-4 text-sm text-zinc-100 transition hover:bg-zinc-900"
    >
      {copied ? "Link copiato!" : "Condividi il tuo profilo"}
    </button>
  );
}
