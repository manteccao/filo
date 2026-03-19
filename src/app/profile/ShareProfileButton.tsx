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
      className="h-10 w-full rounded-2xl border border-[#222222] bg-[#111111] text-sm font-medium text-white transition hover:border-[#8B5CF6]/50 hover:text-[#A78BFA]"
    >
      {copied ? "Link copiato!" : "Condividi il tuo profilo"}
    </button>
  );
}
