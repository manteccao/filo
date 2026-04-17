"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackHandler() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Per il flusso implicit, Supabase gestisce automaticamente i token dall'URL hash
      // Basta controllare se c'è una sessione
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        // Prova anche con exchangeCodeForSession per il caso PKCE
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
          if (codeError) {
            setError(JSON.stringify(codeError));
            return;
          }
        } else {
          // Aspetta un attimo che Supabase processi l'hash
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const {
            data: { session: retrySession },
          } = await supabase.auth.getSession();
          if (!retrySession) {
            setError("Nessuna sessione trovata");
            return;
          }
        }
      }

      // A questo punto abbiamo una sessione
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Utente non trovato");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        router.push("/feed");
      } else {
        router.push("/onboarding");
      }
    };

    handleCallback();
  }, [router, supabase]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 bg-black text-white">
        <h1 className="text-xl font-bold text-red-400">Errore di autenticazione</h1>
        <pre className="bg-gray-800 p-4 rounded max-w-lg overflow-auto text-sm whitespace-pre-wrap">{error}</pre>
        <a href="/login" className="underline text-zinc-400">Torna al login</a>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <p>Accesso in corso...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
          <p>Caricamento...</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
