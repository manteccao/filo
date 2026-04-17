"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackHandler() {
  const router = useRouter();
  const supabase = createClient();

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
            router.push("/login?error=auth_failed");
            return;
          }
        } else {
          // Aspetta un attimo che Supabase processi l'hash
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const {
            data: { session: retrySession },
          } = await supabase.auth.getSession();
          if (!retrySession) {
            router.push("/login?error=auth_failed");
            return;
          }
        }
      }

      // A questo punto abbiamo una sessione
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?error=auth_failed");
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
