"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export const dynamic = "force-static";

function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");

      if (!code) {
        router.push("/login?error=no_code");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setError(error.message);
        router.push("/login?error=auth_failed");
        return;
      }

      // Controlla se l'utente ha già un profilo
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?error=no_user");
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
  }, [searchParams, router, supabase]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Errore di autenticazione. Reindirizzamento...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Accesso in corso...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p>Accesso in corso...</p>
        </div>
      }
    >
      <AuthCallback />
    </Suspense>
  );
}
