import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Controlla se esiste già un profilo
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

          if (profile) {
            // Utente già registrato → feed
            return NextResponse.redirect(new URL("/feed", url.origin), { status: 303 });
          } else {
            // Primo accesso → onboarding
            return NextResponse.redirect(new URL("/onboarding", url.origin), { status: 303 });
          }
        }
      }
    } catch {
      // fall through
    }
  }

  const loginUrl = new URL("/login", url.origin);
  loginUrl.searchParams.set("error", "Autenticazione fallita. Riprova.");
  return NextResponse.redirect(loginUrl, { status: 303 });
}
