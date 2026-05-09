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
      className="h-10 w-full rounded-2xl border border-border bg-card text-sm font-medium text-white transition hover:border-violet/50 hover:text-violet"
    >
      {copied ? "Link copiato!" : "Condividi il tuo profilo"}
    </button>
  );
}
