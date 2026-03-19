import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const EMAIL_OTP_TYPES = new Set([
  "signup",
  "magiclink",
  "recovery",
  "invite",
  "email_change",
] as const);
type EmailOtpType = (typeof EMAIL_OTP_TYPES extends Set<infer T> ? T : never) &
  string;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  const redirectTo = url.searchParams.get("redirectTo") ?? "/profile";
  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/profile";

  try {
    const supabase = await createClient();

    // Covers PKCE redirects (email magic link / OAuth / email confirmations, depending on Supabase setup)
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(safeRedirect, url.origin), {
          status: 303,
        });
      }
    }

    // Covers email confirmation links that include token_hash + type
    if (tokenHash && type) {
      if (!EMAIL_OTP_TYPES.has(type as EmailOtpType)) {
        throw new Error("Invalid OTP type");
      }
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as EmailOtpType,
      });
      if (!error) {
        return NextResponse.redirect(new URL(safeRedirect, url.origin), {
          status: 303,
        });
      }
    }
  } catch {
    // fall through to login
  }

  const loginUrl = new URL("/login", url.origin);
  loginUrl.searchParams.set("error", "Link non valido o scaduto. Riprova.");
  return NextResponse.redirect(loginUrl, { status: 303 });
}

