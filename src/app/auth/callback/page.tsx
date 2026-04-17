"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

function Callback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const code = searchParams.get("code");

    if (!code) {
      router.replace("/login?error=Autenticazione+fallita.+Riprova.");
      return;
    }

    const supabase = createClient();

    supabase.auth.exchangeCodeForSession(code).then(async ({ error }) => {
      if (error) {
        router.replace("/login?error=Autenticazione+fallita.+Riprova.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?error=Autenticazione+fallita.+Riprova.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        router.replace("/feed");
      } else {
        router.replace("/onboarding");
      }
    });
  }, [router, searchParams]);

  return null;
}

const Spinner = (
  <div className="flex min-h-svh items-center justify-center bg-[#0a0a0a]">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
  </div>
);

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={Spinner}>
      <Callback />
    </Suspense>
  );
}
